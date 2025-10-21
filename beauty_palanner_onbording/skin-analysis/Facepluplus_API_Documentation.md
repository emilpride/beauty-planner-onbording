# Face++ Skin Analysis Pro API Documentation

**Version:** 1.7.6

## 1. API Description

The Skin Analysis Pro API provides a professional-grade analysis of facial skin from an image. It offers more detailed and numerical analysis compared to the standard version, covering dimensions like oiliness, sensitivity, roughness, pigmentation, and aging.

---

## 2. Image Requirements

-   **Format:** JPG (JPEG)
-   **Pixel Size:** Minimum 200x200 pixels, Maximum 4096x4096 pixels.
-   **File Size:** Maximum 8 MB.
-   **Minimum Face Size:** For best results, the face in the image (as a square bounding box) should be at least 400 pixels in width.
-   **Face Quality:** Higher quality images yield more accurate results. Factors that negatively impact quality include:
    -   Occlusion of facial features.
    -   Image blur.
    -   Improper lighting (e.g., strong light, low light, backlighting).
    -   Extreme face angles (recommended: yaw ≤ ±30°, pitch ≤ ±40°).

---

## 3. API Endpoint

**URL:** `https://api-cn.faceplusplus.com/facepp/v1/skinanalyze_pro`

**Method:** `POST`

**Request Body Format:** `multipart/form-data`

---

## 4. Request Parameters

### 4.1. Required Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `api_key` | String | Your API Key for authentication. |
| `api_secret` | String | Your API Secret for authentication. |
| `image_url` | String | URL of the frontal face image. |
| *or* `image_file` | File | Binary image file (sent via multipart/form-data). |
| *or* `image_base64` | String | Base64 encoded binary image data. |

**Note:** If `image_url`, `image_file`, and `image_base64` are all provided, the priority is `image_file` > `image_base64` > `image_url`.

### 4.2. Optional Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `left_side_image_url` | String | URL of the left side-face image. Used for jawline analysis. |
| `left_side_image_file`| File | Binary file of the left side-face image. |
| `left_side_image_base64`| String | Base64 encoded data of the left side-face image. |
| `right_side_image_url`| String | URL of the right side-face image. Used for jawline analysis. |
| `right_side_image_file`| File | Binary file of the right side-face image. |
| `right_side_image_base64`| String | Base64 encoded data of the right side-face image. |
| `return_maps` | String | A comma-separated string specifying which analysis maps (images) to return. See section 5.1 for details. Example: `"red_area,brown_area,texture_enhanced_lines"` |
| `return_marks` | String | A comma-separated string specifying which feature coordinates to return. See section 5.2 for details. Example: `"melanin_mark,wrinkle_mark"` |
| `roi_outline_color` | JSON String | Customize the colors for drawing outlines on the `roi_outline_map`. See section 5.3 for details. |
| `return_side_results`| String | A comma-separated string to request results from side-face images. Currently supports `jawline_info`. |

---

## 5. Advanced Optional Parameters

### 5.1. `return_maps` Options

Requesting maps will return images (JPG or PNG) that can be overlaid on the original image to visualize skin issues.

| Value | Description | Returned Image |
| :--- | :--- | :--- |
| `red_area` | Red area map for sensitivity and inflammation. | White background, red areas indicate sensitivity level by shade. |
| `brown_area` | Brown area map for pigmentation. | White background, brown areas indicate pigmentation level by shade. |
| `texture_enhanced_pores` | Map of enlarged pores. | Transparent PNG. |
| `texture_enhanced_blackheads`| Map of blackheads. | Transparent PNG. |
| `texture_enhanced_oily_area`| Map of oily (shiny) areas. | Transparent PNG. |
| `texture_enhanced_lines` | Map of facial lines (deep and fine). | White background PNG. |
| `water_area` | Dehydration map. Deeper blue means more dehydrated. | White background PNG. |
| `rough_area` | Map of rough skin areas. | Transparent PNG. |
| `roi_outline_map` | Outline map for spots and acne. | Transparent PNG. |
| `texture_enhanced_bw` | Black & white enhanced map for pores/blackheads. | Cropped JPG. |

### 5.2. `return_marks` Options

Requesting marks will return detailed coordinates for various facial features and skin issues.

| Value | Description |
| :--- | :--- |
| `wrinkle_mark` | Outline coordinates for wrinkles in various facial regions. |
| `sensitivity_mark` | Polygon coordinates for sensitive (red) areas. |
| `melanin_mark` | Polygon coordinates for pigmented (brown) areas. |
| `dark_circle_outline` | Outline coordinates for dark circles under the eyes. |
| `cheekbone_mark` | Coordinates for the apple muscles (cheekbones). |
| `blackheads_mark` | Coordinates and radius for each blackhead. |
| `pores_mark` | Coordinates and radius for each pore. |

### 5.3. `roi_outline_color` JSON Format

Customize the outline colors for various issues. All values are 6-digit hex color strings (e.g., "CC00FF").

```json
{
  "pores_color": "0000FF",
  "blackhead_color": "FF0000",
  "wrinkle_color": "6E9900",
  "fine_line_color": "8DFE2A",
  "closed_comedones_color": "00FF00",
  "acne_pustule_color": "9F21F6",
  "acne_nodule_color": "FF00FD",
  "acne_color": "FE0100",
  "brown_spot_color": "7E2A28"
}
```

---

## 6. Example Request (Python)

```python
import requests
import base64

# Function to encode image to base64
def encode_image(img_path):
    with open(img_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# API Endpoint
url = "https://api-cn.faceplusplus.com/facepp/v1/skinanalyze_pro"

# Construct payload
payload = {
    'api_key': 'YOUR_API_KEY',
    'api_secret': 'YOUR_API_SECRET',
    'image_base64': encode_image('path/to/your/image.jpg'),
    # Optional: include side images
    # 'left_side_image_base64': encode_image('path/to/left.jpg'),
    # 'right_side_image_base64': encode_image('path/to/right.jpg'),
    # Optional: request specific maps and marks
    'return_maps': 'red_area,brown_area',
    'return_marks': 'melanin_mark,wrinkle_mark,dark_circle_outline',
    'return_side_results': 'jawline_info'
}

# Make the request
response = requests.post(url, data=payload)

# Print the result
print(response.json())
```

---

## 7. Response Body

The response is a JSON object containing the analysis results.

### 7.1. Root Object

| Field | Type | Description |
| :--- | :--- | :--- |
| `request_id` | String | Unique ID for the request. |
| `time_used` | Integer | Total time spent processing the request (in milliseconds). |
| `result` | Object | Contains the main analysis results for the frontal face. See details below. |
| `left_side_result` | Object | Contains analysis results for the left-side face (if provided). |
| `right_side_result`| Object | Contains analysis results for the right-side face (if provided). |
| `face_rectangle` | Object | Bounding box of the detected face (`top`, `left`, `width`, `height`). |
| `error_message` | String | Appears only if the request fails. |

### 7.2. `result` Object Details

The `result` object contains multiple modules, each analyzing a different aspect of the skin.

#### Image Quality (`image_quality`)
- `face_ratio`: Ratio of the face area to the total image area.
- `face_orientation`: 3D angle of the face (`pitch`, `yaw`, `roll`).
- `face_rect`: Coordinates of the face bounding box.
- `hair_occlusion`: Ratio of the face occluded by hair.
- `glasses`: `0` for no glasses, `1` for glasses detected.

#### Skin Type (`skin_type`, `oily_intensity`, `water`)
- `skin_type`: Overall skin type classification.
  - `0`: Oily
  - `1`: Dry
  - `2`: Normal
  - `3`: Combination
- `oily_intensity`: Oiliness analysis for T-zone, cheeks, and full face, including `area` and `intensity` (0: slight, 1: moderate, 2: severe).
- `water`: Dehydration analysis, including `water_area` and `water_severity` score.

#### Skin Tone (`skintone_ita`, `skin_hue_ha`)
- `skintone_ita`: Based on the ITA (Individual Typology Angle) standard.
  - `ita`: The ITA angle value.
  - `skintone`: Classification from 0 (very light) to 5 (dark).
- `skin_hue_ha`: Based on the HA (Hue Angle) standard.
  - `ha`: The HA angle value.
  - `skin_hue`: Classification from 0 (yellowish) to 2 (reddish).

#### Roughness (`blackhead`, `enlarged_pore_count`, `rough`)
- `blackhead`: Severity of blackheads (0: none, 1: mild, 2: moderate, 3: severe).
- `blackhead_count`: Integer count of blackheads.
- `enlarged_pore_count`: Count of enlarged pores for forehead, cheeks, and chin.
- `rough`: Analysis of skin texture roughness, including `rough_area` and `rough_severity`.

#### Pigmentation (`melanin`, `mole`, `brown_spot`)
- `melanin`: Analysis of pigmentation, including `brown_area` (area percentage) and `melanin_concentration` (0-100 score).
- `mole`: Location and confidence for each detected mole.
- `brown_spot`: Location and confidence for each detected brown spot.
- `melasma`: `0` for no melasma, `1` for present.
- `freckle`: `0` for no freckles, `1` for present.

#### Acne (`acne`, `acne_pustule`, `acne_nodule`, `closed_comedones`)
- Provides rectangle and polygon coordinates for different types of acne:
  - `acne`: Mild papules.
  - `acne_pustule`: Pustules (visible pus).
  - `acne_nodule`: Nodules (more severe, hard bumps).
  - `closed_comedones`: Closed comedones (whiteheads).
  - `acne_mark`: Post-inflammatory erythema (red marks).

#### Sensitivity (`sensitivity`)
- `sensitivity_area`: Percentage of the face affected by redness/sensitivity.
- `sensitivity_intensity`: A 0-100 score for the intensity of the sensitivity.

#### Aging (`skin_age`, wrinkle details)
- `skin_age`: An estimated skin age value.
- Provides severity levels (0: none, 1: mild, 2: moderate, 3: severe) for various wrinkle types:
  - `forehead_wrinkle_severity`
  - `crows_feet_severity` (left/right)
  - `eye_finelines_severity` (left/right)
  - `nasolabial_fold_severity` (smile lines)
- Provides detailed `_info` objects for each wrinkle type with scores, depth, length, etc.

#### Eye Area (`eye_pouch`, `dark_circle`)
- `eye_pouch`: `0` for no eye bags, `1` for present. `eye_pouch_severity` gives a 0-2 rating if present.
- `dark_circle`: Type of dark circles (0: none, 1: pigmented, 2: vascular, 3: structural/shadow). `dark_circle_severity` gives a 0-2 rating if present.
- Provides detailed severity for left/right dark circles by type (`_rete`, `_pigment`, `_structural`).

#### Digital Score System (`score_info`)
- A comprehensive scoring system (0-100, higher is generally better) for overall skin health and specific issues.
  - `total_score`
  - `dark_circle_score`
  - `wrinkle_score`
  - `pores_score`
  - `acne_score`
  - `sensitivity_score`
  - `melanin_score`
  - ...and more.

---

## 8. Changelog

-   **1.7.6 (2024-08-06):** Added acne and spot detection for side-face profiles.
-   **1.7.1 (2023-07-28):** Added severity assessment for jawline angle.
-   **1.6.6 (2023-06-14):** Added glasses detection; added scores for dark circles and pores by region.
-   **1.6.2 (2023-04-05):** Added optional `result` for side-face profiles.
-   **1.6.0 (2023-03-23):** Added image quality detection (face ratio, angle, hair occlusion).
-   **1.5.1 (2023-02-17):** Added customizable outline colors for spots, acne, pores, etc. Added jawline angle and apple muscle coordinates.
-   **1.5.0 (2023-01-12):** Introduced the digital scoring system and coordinates for eye bags and facial contours.
-   **1.4.1 (2023-01-10):** Added detailed wrinkle parameters and roughness analysis.
-   **1.4.0 (2023-01-05):** Added moisture detection and polygon coordinates for sensitivity/pigmentation areas.
-   **1.3.0 (2022-10-21):** Updated logic for oiliness and blackhead severity. Added pore severity, dark circle type, and improved wrinkle analysis.
-   **1.2.0 (2022-06-22):** Differentiated acne into more specific types. Added acne mark detection and dark circle severity.
-   **1.1.1 (2022-03-28):** Added detection for deep vs. fine wrinkles.
-   **1.1.0 (2022-03-19):** Optimized image outputs to transparent PNGs to reduce response size.
-   **Beta (2021-10-26):** Initial beta release.
