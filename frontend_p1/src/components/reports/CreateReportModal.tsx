import React, { useState } from 'react';
import type { FieldReport, ReportType, ReportSeverity } from '../../types';
import { X, Send, Camera, MapPin, ClipboardList } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: FieldReport) => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const [reportType, setReportType] = useState<ReportType>('CRACK');
  const [severity, setSeverity] = useState<ReportSeverity>('HIGH');
  const [state, setState] = useState('Sikkim');
  const [district, setDistrict] = useState('East Sikkim');
  const [latitude, setLatitude] = useState('27.3389');
  const [longitude, setLongitude] = useState('88.6065');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const newReport: FieldReport = {
      id: `rep-${Date.now()}`,
      submitted_by: 'NER-OFFICER-09',
      latitude: parseFloat(latitude) || 27.33,
      longitude: parseFloat(longitude) || 88.61,
      state,
      district,
      report_type: reportType,
      severity,
      description,
      observed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onReportCreated(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#0b1329] border border-[#1e293b] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between bg-[#080e1e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Submit Ground Truth Observation</h2>
              <p className="text-xs text-slate-400">Log physical slope crack or road blockage finding</p>
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
          {/* Category & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Observation Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="CRACK" className="bg-[#0b1329]">Tension Crack</option>
                <option value="SLOPE_MOVEMENT" className="bg-[#0b1329]">Slope Movement</option>
                <option value="ROAD_BLOCKAGE" className="bg-[#0b1329]">Road Blockage</option>
                <option value="LANDSLIDE" className="bg-[#0b1329]">Active Landslide</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Observed Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="CRITICAL" className="bg-[#0b1329]">CRITICAL 🔴</option>
                <option value="HIGH" className="bg-[#0b1329]">HIGH 🟠</option>
                <option value="MODERATE" className="bg-[#0b1329]">MODERATE 🟡</option>
                <option value="LOW" className="bg-[#0b1329]">LOW 🟢</option>
              </select>
            </div>
          </div>

          {/* State & District */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Sikkim" className="bg-[#0b1329]">Sikkim</option>
                <option value="Meghalaya" className="bg-[#0b1329]">Meghalaya</option>
                <option value="Arunachal Pradesh" className="bg-[#0b1329]">Arunachal Pradesh</option>
                <option value="Assam" className="bg-[#0b1329]">Assam</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">District / Location</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. East Sikkim"
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Latitude (°N)
              </label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Longitude (°E)
              </label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Field Description & Measurements</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe crack width, displacement rate, seepage, or highway blockage details..."
              className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Photo Attachment Input Simulator */}
          <div className="p-3 border border-dashed border-[#1e293b] rounded-xl flex items-center justify-between text-slate-400 bg-[#111c38]/50">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Attach Field Photograph</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">Geo-tag Auto Sync</span>
          </div>

          {/* Submit Action */}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
