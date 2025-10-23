class WellnessAnalysis {
  final double bmi;
  final double bms;
  final double bmiScore;
  final List<String> positiveFactors;
  final List<String> negativeFactors;

  WellnessAnalysis({
    this.bmi = 0.0,
    this.bms = 0.0,
    this.bmiScore = 0.0,
    required this.positiveFactors,
    required this.negativeFactors,
  });

  //empty constructor
  factory WellnessAnalysis.empty() {
    return WellnessAnalysis(positiveFactors: [], negativeFactors: []);
  }
}
