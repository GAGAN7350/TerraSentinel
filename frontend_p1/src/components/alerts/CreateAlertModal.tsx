import React, { useState } from 'react';
import type { AlertSeverity, Alert } from '../../types';
import { X, Send, AlertTriangle } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated: (alert: Alert) => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  onAlertCreated,
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('CRITICAL');
  const [state, setState] = useState('Sikkim');
  const [district, setDistrict] = useState('East Sikkim');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState<{ sms: boolean; radio: boolean; app: boolean }>({
    sms: true,
    radio: true,
    app: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newAlert: Alert = {
      id: `alt-${Date.now()}`,
      alert_type: 'EMERGENCY_BROADCAST',
      severity,
      title,
      message,
      state,
      district,
      latitude: 27.33,
      longitude: 88.61,
      risk_prediction_id: null,
      status: 'ACTIVE',
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    onAlertCreated(newAlert);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between bg-[#080e1e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Broadcast Emergency Alert</h2>
              <p className="text-xs text-slate-400">Dispatch warning to EOC radio & SMS gateways</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#111c38] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-200">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Alert Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Teesta NH-10 Slope Failure Imminent Warning"
              className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Severity & State Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 transition"
              >
                <option value="CRITICAL" className="bg-[#0b1329]">CRITICAL 🔴</option>
                <option value="HIGH" className="bg-[#0b1329]">HIGH 🟠</option>
                <option value="WARNING" className="bg-[#0b1329]">WARNING 🟡</option>
                <option value="INFO" className="bg-[#0b1329]">INFO 🔵</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Target State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 transition"
              >
                <option value="Sikkim" className="bg-[#0b1329]">Sikkim</option>
                <option value="Meghalaya" className="bg-[#0b1329]">Meghalaya</option>
                <option value="Arunachal Pradesh" className="bg-[#0b1329]">Arunachal Pradesh</option>
                <option value="Assam" className="bg-[#0b1329]">Assam</option>
              </select>
            </div>
          </div>

          {/* District */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Target District / Corridor</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. East Sikkim / Teesta Basin"
              className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Broadcast Message</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter detailed hazard instructions and evacuation advisory..."
              className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Broadcast Channels Toggles */}
          <div className="space-y-2 pt-1">
            <span className="font-semibold text-slate-300 block">Dispatch Channels</span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 bg-[#111c38] border border-[#1e293b] p-2.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="accent-rose-500"
                />
                <span className="text-[11px] font-semibold text-slate-200">SMS Gateway</span>
              </label>

              <label className="flex items-center gap-2 bg-[#111c38] border border-[#1e293b] p-2.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.radio}
                  onChange={(e) => setChannels({ ...channels, radio: e.target.checked })}
                  className="accent-rose-500"
                />
                <span className="text-[11px] font-semibold text-slate-200">EOC Radio</span>
              </label>

              <label className="flex items-center gap-2 bg-[#111c38] border border-[#1e293b] p-2.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.app}
                  onChange={(e) => setChannels({ ...channels, app: e.target.checked })}
                  className="accent-rose-500"
                />
                <span className="text-[11px] font-semibold text-slate-200">App Push</span>
              </label>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#111c38] hover:bg-[#1a274c] text-slate-300 rounded-xl transition font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold rounded-xl shadow-lg transition"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Alert Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
