import 'dart:developer';
import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../utils/exceptions/exceptions.dart';
import '../../../utils/exceptions/format_exceptions.dart';
import '../../../utils/exceptions/platform_exceptions.dart';
import '../../models/ai_analysis_model.dart';

class AIAnalysisRepository extends GetxController {
  static AIAnalysisRepository get instance => Get.find();

  final _db = FirebaseFirestore.instance;

  Future<void> saveAnalysis(String userId, AIAnalysisModel analysis) async {
    try {
      await _db
          .collection('Users')
          .doc(userId)
          .collection('AIAnalysis')
          .doc(analysis.id)
          .set(analysis.toJson());
    } on FirebaseAuthException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FirebaseException catch (e) {
      throw MyFirebaseExceptions(e.code).message;
    } on FormatException catch (_) {
      throw MyFormatException();
    } on PlatformException catch (e) {
      throw MyPlatformExceptions(e.code).message;
    } catch (e) {
      log(e.toString());
      throw 'Something went wrong, Please try again';
    }
  }

  //get the latest AI analysis for a user
  Future<AIAnalysisModel> fetchAnalysis(String userId) async {
    try {
      final documentSnapshot =
          await _db
              .collection('Users')
              .doc(userId)
              .collection('AIAnalysis')
              .orderBy('date', descending: true)
              .limit(1)
              .get();
      if (documentSnapshot.docs.isNotEmpty) {
        return AIAnalysisModel.fromJson(documentSnapshot.docs.first.data());
      } else {
        return AIAnalysisModel.empty();
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
      log(e.toString());
      throw 'Something went wrong, Please try again';
    }
  }

  Future<String> uploadImage(String path, XFile image) async {
    try {
      final ref = FirebaseStorage.instance.ref(path).child(image.name);
      await ref.putFile(File(image.path));

      final url = await ref.getDownloadURL();
      return url;
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
}
