class MyFormatException implements Exception {
  final String message;

  MyFormatException(
      [this.message =
          'An unexpected format error occured. Please check your input.']);

  factory MyFormatException.fromMessage(String message) {
    return MyFormatException(message);
  }

  String get formattedMessage => message;

  factory MyFormatException.fromCode(String code) {
    switch (code) {
      case 'invalid-email-format':
        return MyFormatException(
            'The email address format is invalid. Please enter a valid email.');
      case 'invalid-phone-number-format':
        return MyFormatException(
            'The provided phone number format is invalid. Please enter a valid phone number.');
      case 'invalid-date-format':
        return MyFormatException(
            'The date format is invalid. Please enter a valid date.');
      case 'invalid-url-format':
        return MyFormatException(
            'The URL format is invalid. Please enter a valid URL.');
      case 'invalid-credit-card-format':
        return MyFormatException(
            'The credit card format is invalid. Please enter a valid credit card number');
      case 'invalid-numeric-format':
        return MyFormatException('The input should be a valid numeric format');

      default:
        return MyFormatException();
    }
  }
}
