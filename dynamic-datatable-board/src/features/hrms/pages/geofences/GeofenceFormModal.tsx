import React, { useState, useEffect, useRef } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { geofenceApi } from '@/api/hrms/geofence';
import { GeofenceFormDto } from '@/dto/hrms/geofence';

interface GeofenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view' | 'edit';
  geofenceData?: any;
  onSave: () => void | Promise<void>;
}

export function GeofenceFormModal({
  isOpen,
  onClose,
  mode,
  geofenceData,
  onSave,
}: GeofenceFormModalProps) {
  const [formData, setFormData] = useState<GeofenceFormDto>({
    name: '',
    latitude: 13.7563, // Default center: Bangkok
    longitude: 100.5018,
    radiusInMeters: 150,
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GeofenceFormDto, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const mapContainerId = "geofence-modal-map";

  // Synchronize initial data
  useEffect(() => {
    if (geofenceData && (mode === 'view' || mode === 'edit')) {
      setFormData({
        name: geofenceData.name || '',
        latitude: Number(geofenceData.latitude) || 13.7563,
        longitude: Number(geofenceData.longitude) || 100.5018,
        radiusInMeters: Number(geofenceData.radiusInMeters || geofenceData.radius || 150),
        description: geofenceData.description || '',
        isActive: geofenceData.isActive !== false,
      });
      setErrors({});
    } else if (mode === 'create') {
      setFormData({
        name: '',
        latitude: 13.7563,
        longitude: 100.5018,
        radiusInMeters: 150,
        description: '',
        isActive: true,
      });
      setErrors({});
    }
  }, [geofenceData, mode, isOpen]);

  // Handle Leaflet Map Initialization and updates
  useEffect(() => {
    if (!isOpen) {
      // Cleanup map when modal closes
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
      return;
    }

    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet (L) is not loaded on the window object.");
      return;
    }

    // Small delay to ensure container is fully rendered in DOM
    const timer = setTimeout(() => {
      const mapContainer = document.getElementById(mapContainerId);
      if (!mapContainer) return;

      const center: [number, number] = [formData.latitude, formData.longitude];

      // Initialize Map if it doesn't exist yet
      if (!mapRef.current) {
        const map = L.map(mapContainerId).setView(center, 15);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add Marker
        const marker = L.marker(center, {
          draggable: mode !== 'view',
          icon: customIcon
        }).addTo(map);
        markerRef.current = marker;

        // Add Circle
        const circle = L.circle(center, {
          color: '#3b82f6',
          fillColor: '#93c5fd',
          fillOpacity: 0.4,
          radius: formData.radiusInMeters
        }).addTo(map);
        circleRef.current = circle;

        // Map click handler (update coordinates)
        if (mode !== 'view') {
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            const fixedLat = parseFloat(lat.toFixed(6));
            const fixedLng = parseFloat(lng.toFixed(6));
            setFormData(prev => ({
              ...prev,
              latitude: fixedLat,
              longitude: fixedLng
            }));
          });

          // Marker drag handler
          marker.on('dragend', (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            const fixedLat = parseFloat(lat.toFixed(6));
            const fixedLng = parseFloat(lng.toFixed(6));
            setFormData(prev => ({
              ...prev,
              latitude: fixedLat,
              longitude: fixedLng
            }));
          });
        }
      } else {
        // Map is already loaded, update view
        mapRef.current.setView(center);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Keep Map components (marker & circle) in sync with local form state updates
  useEffect(() => {
    if (mapRef.current && markerRef.current && circleRef.current) {
      const center: [number, number] = [formData.latitude, formData.longitude];
      markerRef.current.setLatLng(center);
      circleRef.current.setLatLng(center);
      circleRef.current.setRadius(formData.radiusInMeters);
      mapRef.current.setView(center);
    }
  }, [formData.latitude, formData.longitude, formData.radiusInMeters]);

  if (!isOpen) return null;

  const isView = mode === 'view';
  const titleText = mode === 'create' ? 'Create Geofence' : mode === 'edit' ? 'Edit Geofence' : 'Geofence Details';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GeofenceFormDto, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Geofence Name is required';
    if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (isNaN(formData.radiusInMeters) || formData.radiusInMeters <= 0) {
      newErrors.radiusInMeters = 'Radius must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await geofenceApi.create(formData);
      } else if (mode === 'edit' && geofenceData?.id) {
        await geofenceApi.update(geofenceData.id, formData);
      }

      await onSave();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-5xl w-full h-[620px] overflow-hidden text-left animate-in zoom-in-95 duration-200 m-4 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center font-bold">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest leading-none">
                {titleText}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {mode === 'create' ? 'Configure New Perimeter boundary' : `Geofence ID: ${geofenceData?.id}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form & Map Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CustomInput
              label="Geofence Name"
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              error={errors.name}
              disabled={isView}
              placeholder="e.g. Headquarters Office, Warehouse 1"
            />

            <div className="grid grid-cols-2 gap-4">
              <CustomInput
                label="Latitude"
                value={String(formData.latitude)}
                onChange={(val) => setFormData({ ...formData, latitude: parseFloat(val) || 0 })}
                error={errors.latitude}
                disabled={isView}
                type="number"
                step="0.000001"
                placeholder="e.g. 13.7563"
              />

              <CustomInput
                label="Longitude"
                value={String(formData.longitude)}
                onChange={(val) => setFormData({ ...formData, longitude: parseFloat(val) || 0 })}
                error={errors.longitude}
                disabled={isView}
                type="number"
                step="0.000001"
                placeholder="e.g. 100.5018"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  Radius: {formData.radiusInMeters} meters
                </label>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={formData.radiusInMeters}
                onChange={(e) => setFormData({ ...formData, radiusInMeters: parseInt(e.target.value) || 100 })}
                disabled={isView}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 disabled:opacity-50"
              />
              {errors.radiusInMeters && (
                <p className="text-xs text-red-500 mt-1">{errors.radiusInMeters}</p>
              )}
            </div>

            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isView}
                rows={3}
                placeholder="Details of the geofenced zone location..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none transition-all duration-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-100 disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={isView}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 disabled:opacity-50 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-600 uppercase tracking-wider select-none cursor-pointer">
                Active Zone Boundary
              </label>
            </div>
          </div>

          <div className="flex flex-col h-[320px] md:h-auto min-h-[300px]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none mb-1.5">
              Interactive Map boundary
            </span>
            <div 
              id={mapContainerId} 
              className="flex-1 w-full bg-slate-100 rounded-xl border border-slate-200 shadow-inner overflow-hidden z-10"
            />
            {mode !== 'view' && (
              <span className="text-[10px] text-slate-400 mt-1.5 italic">
                * Click anywhere on the map or drag the pin to set the center location.
              </span>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3.5">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            {isView ? 'Close' : 'Cancel'}
          </CustomButton>
          {!isView && (
            <CustomButton
              type="button"
              onClick={handleSubmit}
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Save className="h-4 w-4" />}
              className="text-xs font-bold px-5 py-2.5"
            >
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
