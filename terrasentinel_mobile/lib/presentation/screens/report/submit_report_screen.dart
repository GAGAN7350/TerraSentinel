import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../data/repositories/field_report_repository.dart';
import '../../data/models/field_report_model.dart';

class SubmitReportScreen extends StatefulWidget {
  const SubmitReportScreen({Key? key}) : super(key: key);

  @override
  State<SubmitReportScreen> createState() => _SubmitReportScreenState();
}

class _SubmitReportScreenState extends State<SubmitReportScreen> {
  final FieldReportRepository _repository = FieldReportRepository();
  final ImagePicker _picker = ImagePicker();

  String _reportType = 'LANDSLIDE';
  String _severity = 'HIGH';
  final TextEditingController _descController = TextEditingController();
  File? _imageFile;
  double? _latitude;
  double? _longitude;
  bool _isLoadingGps = false;
  bool _isSubmitting = false;

  List<FieldReportModel> _pendingReports = [];

  @override
  void initState() {
    super.initState();
    _fetchGpsCoordinates();
    _loadPendingReports();
  }

  Future<void> _loadPendingReports() async {
    final list = await _repository.getPendingReports();
    if (mounted) setState(() => _pendingReports = list);
  }

  Future<void> _fetchGpsCoordinates() async {
    setState(() => _isLoadingGps = true);
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 5),
      );
      if (mounted) {
        setState(() {
          _latitude = pos.latitude;
          _longitude = pos.longitude;
          _isLoadingGps = false;
        });
      }
    } catch (_) {
      final lastPos = await Geolocator.getLastKnownPosition();
      if (mounted) {
        setState(() {
          _latitude = lastPos?.latitude ?? 27.33;
          _longitude = lastPos?.longitude ?? 88.61;
          _isLoadingGps = false;
        });
      }
    }
  }

  Future<void> _takePhoto() async {
    final picked = await _picker.pickImage(source: ImageSource.camera, maxWidth: 1200);
    if (picked != null) {
      setState(() => _imageFile = File(picked.path));
    }
  }

  Future<void> _submitReport() async {
    if (_latitude == null || _longitude == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please wait for GPS lock...')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _repository.submitReport(
        latitude: _latitude!,
        longitude: _longitude!,
        state: 'Sikkim',
        district: 'East Sikkim',
        reportType: _reportType,
        severity: _severity,
        description: _descController.text,
        photoPath: _imageFile?.path,
        observedAt: DateTime.now(),
      );

      _descController.clear();
      setState(() => _imageFile = null);
      await _loadPendingReports();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF10B981),
          content: Text('Report saved to Offline Outbox! Auto-sync active.'),
        ),
      );
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: const Text('Field Incident Report', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // GPS Lock Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.cyanAccent.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                _isLoadingGps
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.cyanAccent))
                    : const Icon(Icons.gps_fixed_rounded, color: Colors.cyanAccent, size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('GNSS Coordinates Locked:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      Text(
                        _latitude != null
                            ? '${_latitude!.toStringAsFixed(5)}° N, ${_longitude!.toStringAsFixed(5)}° E'
                            : 'Acquiring GPS coordinates...',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white60),
                  onPressed: _fetchGpsCoordinates,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Photo Capture Preview
          GestureDetector(
            onTap: _takePhoto,
            child: Container(
              height: 160,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white24, style: BorderStyle.solid),
                image: _imageFile != null
                    ? DecorationImage(image: FileImage(_imageFile!), fit: BoxFit.cover)
                    : null,
              ),
              child: _imageFile == null
                  ? const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.camera_alt_rounded, color: Colors.cyanAccent, size: 40),
                        SizedBox(height: 8),
                        Text('Tap to Capture Landslide Photo Evidence', style: TextStyle(color: Colors.white60, fontSize: 13)),
                      ],
                    )
                  : Align(
                      alignment: Alignment.topRight,
                      child: Container(
                        margin: const EdgeInsets.all(8),
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                        child: const Icon(Icons.edit, color: Colors.white, size: 20),
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 16),

          // Category and Severity Selectors
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _reportType,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    labelText: 'Report Type',
                    labelStyle: const TextStyle(color: Colors.white60),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: ['LANDSLIDE', 'ROCKFALL', 'SUBSIDENCE', 'CRACK', 'ROAD_BLOCK'].map((t) {
                    return DropdownMenuItem(value: t, child: Text(t));
                  }).toList(),
                  onChanged: (v) => setState(() => _reportType = v!),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _severity,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                  decoration: InputDecoration(
                    labelText: 'Severity',
                    labelStyle: const TextStyle(color: Colors.white60),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map((s) {
                    return DropdownMenuItem(value: s, child: Text(s));
                  }).toList(),
                  onChanged: (v) => setState(() => _severity = v!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Description field
          TextField(
            controller: _descController,
            maxLines: 3,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              labelText: 'Observations, Road Name, Estimated Width/Length...',
              labelStyle: const TextStyle(color: Colors.white60),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 16),

          // Submit button
          SizedBox(
            height: 50,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0284C7),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: _isSubmitting
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.cloud_upload_rounded),
              label: const Text('SAVE & QUEUE FOR BACKGROUND SYNC', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: _isSubmitting ? null : _submitReport,
            ),
          ),
          const SizedBox(height: 24),

          // Offline Outbox Status
          if (_pendingReports.isNotEmpty) ...[
            Text(
              'Offline Outbox Queue (${_pendingReports.length} pending sync):',
              style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            ..._pendingReports.map((r) {
              return Card(
                color: const Color(0xFF1E293B),
                child: ListTile(
                  leading: const Icon(Icons.pending_actions_rounded, color: Colors.amberAccent),
                  title: Text('${r.reportType} (${r.severity})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  subtitle: Text('At (${r.latitude.toStringAsFixed(3)}, ${r.longitude.toStringAsFixed(3)}) • ${r.syncStatus}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                ),
              );
            }).toList(),
          ],
        ],
      ),
    );
  }
}
