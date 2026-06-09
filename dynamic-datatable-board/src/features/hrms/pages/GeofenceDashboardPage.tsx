import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Plus,
  Compass,
  Locate,
} from 'lucide-react';
import { DataTable, DataTableColumnDef, TableQueryParams } from '@/components/shared/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { geofenceApi } from '@/api/hrms/geofence';
import { CustomCard } from '@/components/custom/CustomCard';
import { CustomButton } from '@/components/custom/CustomButton';
import { GeofenceFormModal } from './geofences/GeofenceFormModal';
import { GeofenceResponse } from '@/dto/hrms/geofence';

export function GeofenceDashboardPage() {
  const [activeRowMenuId, setActiveRowMenuId] = useState<number | null>(null);

  // Dialog/Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedGeofence, setSelectedGeofence] = useState<GeofenceResponse | null>(null);

  // Reload counter to force table re-fetch
  const [refreshCounter, setRefreshCounter] = useState(0);

  // List of all loaded geofences to display on the overview map
  const [geofencesList, setGeofencesList] = useState<GeofenceResponse[]>([]);
  const dashboardMapRef = useRef<any>(null);
  const dashboardMarkersRef = useRef<any[]>([]);
  const dashboardCirclesRef = useRef<any[]>([]);
  const mapContainerId = "geofence-dashboard-overview-map";

  // KPIs
  const totalGeofences = geofencesList.length;
  const activeGeofences = geofencesList.filter(g => g.isActive).length;
  const averageRadius = totalGeofences > 0 
    ? Math.round(geofencesList.reduce((acc, curr) => acc + curr.radiusInMeters, 0) / totalGeofences) 
    : 0;

  // Initialize and update the dashboard overview map
  useEffect(() => {
    const L = (window as any).L;
    if (!L) return;

    const mapContainer = document.getElementById(mapContainerId);
    if (!mapContainer) return;

    // Check if map is already initialized
    if (!dashboardMapRef.current) {
      const initialCenter: [number, number] = [13.7563, 100.5018]; // Default Bangkok
      const map = L.map(mapContainerId).setView(initialCenter, 11);
      dashboardMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
    }

    const map = dashboardMapRef.current;

    // Clear existing markers & circles
    dashboardMarkersRef.current.forEach(m => m.remove());
    dashboardCirclesRef.current.forEach(c => c.remove());
    dashboardMarkersRef.current = [];
    dashboardCirclesRef.current = [];

    if (geofencesList.length === 0) return;

    const bounds: any[] = [];
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    geofencesList.forEach(zone => {
      const pos: [number, number] = [zone.latitude, zone.longitude];
      bounds.push(pos);

      // Marker
      const marker = L.marker(pos, { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${zone.name}</b><br/>Radius: ${zone.radiusInMeters}m<br/>${zone.description || ''}`);
      dashboardMarkersRef.current.push(marker);

      // Circle
      const circle = L.circle(pos, {
        color: zone.isActive ? '#10b981' : '#ef4444',
        fillColor: zone.isActive ? '#a7f3d0' : '#fca5a5',
        fillOpacity: 0.35,
        radiusInMeters: zone.radiusInMeters
      }).addTo(map);
      dashboardCirclesRef.current.push(circle);
    });

    // Fit map bounds to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
    
    // Invalidate size to guarantee the container renders correctly in its new row position
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [geofencesList]);

  const columns: DataTableColumnDef<GeofenceResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Geofence Name',
      isGlobalFilter: true,
      filterablebar: true,
      filterType: 'string',
      filterPlaceholder: 'Search name...',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.original.name}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Lat: {row.original.latitude.toFixed(4)}, Lng: {row.original.longitude.toFixed(4)}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'radiusInMeters',
      header: 'Radius (m)',
      cell: ({ row }) => (
        <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-100 font-mono">
          {row.original.radiusInMeters}m
        </span>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-slate-500 text-xs italic line-clamp-1">{row.original.description || '-'}</span>
      )
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        const item = row.original;
        const isMenuOpen = activeRowMenuId === item.id;
        return (
          <div className="relative text-left">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 flex items-center justify-center rounded-lg border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-xs font-bold text-lg select-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveRowMenuId(isMenuOpen ? null : item.id);
              }}
            >
              ···
            </Button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveRowMenuId(null); }} />
                <div className="absolute right-0 mt-1.5 w-32 rounded-lg border border-slate-200 bg-white py-1.5 shadow-lg z-50 text-left animate-in fade-in-50 duration-100" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      if (dashboardMapRef.current) {
                        dashboardMapRef.current.setView([item.latitude, item.longitude], 16);
                      }
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-blue-650 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Locate on Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGeofence(item);
                      setDialogMode('view');
                      setIsDialogOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGeofence(item);
                      setDialogMode('edit');
                      setIsDialogOpen(true);
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this geofence?')) {
                        await geofenceApi.delete(item.id);
                        setRefreshCounter((prev) => prev + 1);
                      }
                      setActiveRowMenuId(null);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-650 hover:bg-red-50 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const fetchGeofences = async (params: TableQueryParams) => {
    const payload = {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      ...params.filters
    };

    const response = await geofenceApi.getGeofences(payload);
    const serverPayload = response.data;
    const rawItems = serverPayload?.items || [];

    const mappedItems: GeofenceResponse[] = rawItems.map((item: any) => ({
      id: item.id || item.Id,
      name: item.name || item.Name || '',
      latitude: Number(item.latitude || item.Latitude || 0),
      longitude: Number(item.longitude || item.Longitude || 0),
      radiusInMeters: Number(item.radiusInMeters || item.RadiusInMeters || item.radius || item.Radius || 0),
      description: item.description || item.Description || '',
      isActive: item.isActive !== false,
    }));

    // Save current items in state to display on the overview map
    setGeofencesList(mappedItems);

    return {
      items: mappedItems,
      totalCount: serverPayload?.totalCount || 0,
      pageSize: params.pageSize,
      pageIndex: params.pageIndex
    };
  };

  const handleSaveGeofence = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Controls Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
            Geofence Area Boundary Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Define spatial perimeters for automatic employee biometrics check-ins.
          </p>
        </div>
      </div>

      <CustomButton
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() => {
          setSelectedGeofence(null);
          setDialogMode('create');
          setIsDialogOpen(true);
        }}
      >
        Add New Boundary
      </CustomButton>

      {/* KPI Bento Box Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomCard
          icon={<Compass className="h-5 w-5" />}
          title="Total Bound Areas"
          value={<>{totalGeofences} <span className="text-xs text-slate-400 font-normal">configured zones</span></>}
          iconBgClass="bg-slate-50 border-slate-100"
          iconTextClass="text-slate-700"
          gradientFrom="from-white"
          gradientTo="to-slate-50/50"
        />
        <CustomCard
          icon={<Locate className="h-5 w-5" />}
          title="Active Fences"
          value={<>{activeGeofences} <span className="text-xs text-emerald-600 font-bold">online checkin</span></>}
          iconBgClass="bg-emerald-50 border-emerald-100"
          iconTextClass="text-emerald-600"
          gradientFrom="from-white"
          gradientTo="to-emerald-50/20"
        />
        <CustomCard
          icon={<MapPin className="h-5 w-5" />}
          title="Average Radius Size"
          value={<>{averageRadius}m <span className="text-xs text-blue-650 font-normal">perimeter</span></>}
          iconBgClass="bg-blue-50 border-blue-100"
          iconTextClass="text-blue-650"
          gradientFrom="from-white"
          gradientTo="to-blue-50/20"
        />
      </div>

     
      {/* Row 3: Datatable (Full Width) */}
      <div className="w-full space-y-4">
        <DataTable
          key={refreshCounter}
          columns={columns}
          fetchData={fetchGeofences}
          filterslot={3}
          filterableActive={true}
        />
      </div>

      <GeofenceFormModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        geofenceData={selectedGeofence}
        onSave={handleSaveGeofence}
      />
    </div>
  );
}
