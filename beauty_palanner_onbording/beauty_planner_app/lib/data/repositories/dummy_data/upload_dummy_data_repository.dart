import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../../../utils/exceptions/exceptions.dart';
import '../../../utils/exceptions/format_exceptions.dart';
import '../../../utils/exceptions/platform_exceptions.dart';
import '../../models/mood_model.dart';
import '../../models/weight_model.dart';

class UploadDummyDataRepository extends GetxController {
  static UploadDummyDataRepository get instance => Get.find();

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> uploadDummyMoodData(List<MoodEntry> moods, String petId) async {
    try {
      for (var mood in moods) {
        await _db
            .collection('Users')
            .doc(petId)
            .collection('Moods')
            .doc(mood.id)
            .set(mood.toJson());
      }
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw 'Something went wrong, Please try again';
    }
  }

  Future<void> uploadDummyWeightData(
    List<WeightModel> weights,
    String petId,
  ) async {
    try {
      for (var weight in weights) {
        await _db
            .collection('Users')
            .doc(petId)
            .collection('Weights')
            .doc(weight.id)
            .set(weight.toJson());
      }
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      throw e.toString(); //'Something went wrong, Please try again';
    }
  }
}
