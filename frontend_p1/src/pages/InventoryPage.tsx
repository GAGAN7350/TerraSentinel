import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { InventoryHeader } from '../components/inventory/InventoryHeader';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryMapPreview } from '../components/inventory/InventoryMapPreview';
import { MOCK_LANDSLIDES } from '../services/api';
import type { Landslide } from '../types';
import { CheckCircle2 } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [landslides] = useState<Landslide[]>(MOCK_LANDSLIDES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedMovement, setSelectedMovement] = useState<string>('All Movement Types');
  const [selectedLandslide, setSelectedLandslide] = useState<Landslide | null>(MOCK_LANDSLIDES[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statistics
  const counts = useMemo(() => {
    const gsi = landslides.filter((l) => l.source === 'GSI_BHUSANKET').length;
    const nrsc = landslides.filter((l) => l.source === 'NRSC').length;
    return { gsi, nrsc, total: landslides.length };
  }, [landslides]);

  // Filtered dataset
  const filteredLandslides = useMemo(() => {
    return landslides.filter((ls) => {
      const matchesSearch =
        (ls.slide_name && ls.slide_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ls.slide_no && ls.slide_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ls.district && ls.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ls.nh_sh_location && ls.nh_sh_location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = selectedState === 'All States' || ls.state === selectedState;
      const matchesMovement = selectedMovement === 'All Movement Types' || ls.movement_type === selectedMovement;

      return matchesSearch && matchesState && matchesMovement;
    });
  }, [landslides, searchQuery, selectedState, selectedMovement]);

  const handleExportGeoJSON = (record?: Landslide) => {
    const exportData = record ? [record] : filteredLandslides;
    const geojson = {
      type: 'FeatureCollection',
      features: exportData.map((item) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        },
        properties: {
          id: item.id,
          slide_no: item.slide_no,
          slide_name: item.slide_name,
          state: item.state,
          district: item.district,
          movement_type: item.movement_type,
          source: item.source,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record ? `landslide_${record.id}.geojson` : 'terrasentinel_landslide_inventory.geojson';
    a.click();
    URL.revokeObjectURL(url);

    setToastMessage(`Downloaded GeoJSON Dataset (${exportData.length} records)`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <InventoryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedMovement={selectedMovement}
          onMovementChange={setSelectedMovement}
          onExportAllGeoJSON={() => handleExportGeoJSON()}
          counts={counts}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InventoryTable
              landslides={filteredLandslides}
              selectedId={selectedLandslide?.id || null}
              onSelectLandslide={setSelectedLandslide}
              onExportRecordGeoJSON={(ls) => handleExportGeoJSON(ls)}
            />
          </div>

          <div>
            <InventoryMapPreview landslide={selectedLandslide} />
          </div>
        </div>

        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-cyan-600 border border-cyan-400 text-white rounded-2xl shadow-2xl z-50 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
};
