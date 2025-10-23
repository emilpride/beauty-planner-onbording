enum Textsizes { small, medium, large }

enum PaymentMethods {
  paypal,
  googlePay,
  applePay,
  Visa,
  masterCard,
  creditCard,
  paystack,
  razorPay,
  paytm,
}

// Enum to represent the selected frequency
enum RepeatFrequency { daily, weekly, monthly }

enum TaskStatus {
  pending, // The task is due and has not been actioned.
  completed, // The user marked the task as done.
  skipped, // The user intentionally skipped the task.
  missed, // The task was due in the past and not completed.
  deleted, // The user deleted the task.
}

enum NotificationType { dailySummary, taskReminder, advanceReminder }

enum ActivityChangeType {
  schedule, // time, frequency, selected days, etc.
  metadata, // name, color, note, etc.
  status, // active/inactive
}
