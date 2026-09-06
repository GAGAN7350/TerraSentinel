import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { AlertsHeader } from '../components/alerts/AlertsHeader';
import { AlertsList } from '../components/alerts/AlertsList';
import { CreateAlertModal } from '../components/alerts/CreateAlertModal';
import { MOCK_ALERTS } from '../services/api';
import type { Alert, AlertSeverity } from '../types';
import { CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statistics calculation
  const counts = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
    const warning = alerts.filter((a) => (a.severity === 'WARNING' || a.severity === 'HIGH') && a.status === 'ACTIVE').length;
    const info = alerts.filter((a) => a.severity === 'INFO' && a.status === 'ACTIVE').length;
    return { critical, warning, info, total: alerts.length };
  }, [alerts]);

  // Filtered Alerts List
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alt) => {
      const matchesSearch =
        alt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (alt.district && alt.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (alt.state && alt.state.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity = selectedSeverity === 'ALL' || alt.severity === selectedSeverity;

      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchQuery, selectedSeverity]);

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
    setToastMessage('Alert marked as RESOLVED and archived');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAlertCreated = (newAlert: Alert) => {
    setAlerts((prev) => [newAlert, ...prev]);
    setToastMessage(`Emergency broadcast issued for ${newAlert.title}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <AlertsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSeverity={selectedSeverity}
          onSeverityChange={setSelectedSeverity}
          onOpenCreateModal={() => setIsModalOpen(true)}
          counts={counts}
        />

        <AlertsList
          alerts={filteredAlerts}
          onResolveAlert={handleResolveAlert}
        />

        <CreateAlertModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAlertCreated={handleAlertCreated}
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
