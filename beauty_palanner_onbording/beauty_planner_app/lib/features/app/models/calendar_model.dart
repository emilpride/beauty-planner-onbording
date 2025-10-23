// Display model to combine data for the UI
import '../../../data/models/activity_model.dart';
import 'task_model.dart';

class CalendarTaskDisplay {
  final TaskInstance instance;
  final ActivityModel activity;

  CalendarTaskDisplay({required this.instance, required this.activity});
}
