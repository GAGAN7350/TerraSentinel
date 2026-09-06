import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { ReportsHeader } from '../components/reports/ReportsHeader';
import { ReportsFeed } from '../components/reports/ReportsFeed';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import type { FieldReport, ReportType } from '../types';
import { CheckCircle2 } from 'lucide-react';

const INITIAL_REPORTS: FieldReport[] = [
  {
    id: 'rep-001',
    submitted_by: 'OFFICER-SKM-04',
    latitude: 27.3389,
    longitude: 88.6065,
    state: 'Sikkim',
    district: 'East Sikkim',
    report_type: 'CRACK',
    severity: 'HIGH',
    description: 'Fresh longitudinal tension crack (width 4.5cm, length 12m) observed along NH-10 road shoulder near Km 14 Teesta slope. Water seepage present along lower boundary.',
    observed_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-002',
    submitted_by: 'OFFICER-MEG-12',
    latitude: 25.5788,
    longitude: 91.8931,
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    report_type: 'SLOPE_MOVEMENT',
    severity: 'CRITICAL',
    description: 'Active soil creep & debris slumping noticed above Shillong bypass highway. Minor rockfall debris obstructing outer lane.',
    observed_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rep-003',
    submitted_by: 'OFFICER-ASM-07',
    latitude: 24.8211,
    longitude: 92.7989,
    state: 'Assam',
    district: 'Cachar',
    report_type: 'ROAD_BLOCKAGE',
    severity: 'MODERATE',
    description: 'Tree root failure & shallow mudslide covering 15 meters of SH-11 rural connector. Clearance team dispatched.',
    observed_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<FieldReport[]>(INITIAL_REPORTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ReportType | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statistics
  const counts = useMemo(() => {
    const crack = reports.filter((r) => r.report_type === 'CRACK').length;
    const slope = reports.filter((r) => r.report_type === 'SLOPE_MOVEMENT').length;
    const road = reports.filter((r) => r.report_type === 'ROAD_BLOCKAGE').length;
    const slide = reports.filter((r) => r.report_type === 'LANDSLIDE').length;
    return { crack, slope, road, slide, total: reports.length };
  }, [reports]);

  // Filtered List
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch =
        (rep.description && rep.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rep.submitted_by && rep.submitted_by.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rep.district && rep.district.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === 'ALL' || rep.report_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedType]);

  const handleReportCreated = (newReport: FieldReport) => {
    setReports((prev) => [newReport, ...prev]);
    setToastMessage(`Field Observation logged successfully for ${newReport.district}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <ReportsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          onOpenCreateModal={() => setIsModalOpen(true)}
          counts={counts}
        />

        <ReportsFeed reports={filteredReports} />

        <CreateReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReportCreated={handleReportCreated}
        />

        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-emerald-600 border border-emerald-400 text-white rounded-2xl shadow-2xl z-50 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
};
