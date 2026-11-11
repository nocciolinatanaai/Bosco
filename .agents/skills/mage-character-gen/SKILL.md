---
name: mage-character-gen
description: Prepare and generate original semi-realistic MYTHWOOD character concept art through a verified Mage Space API, with cinematic relighting, skin detail and consistent front/side/back turnarounds.
---

# Mage Space — character concept art

## Scope

Use this skill for original MYTHWOOD heroes, enemies and costume studies. Read
AGENTS.md, HANDOFF.md, docs/COLLABORATION.md and docs/ENEMY_ART_DIRECTION.md first.
Aim for the material richness, adult proportions and cinematic presentation
associated with Unreal Engine 5 and Final Fantasy VII Remake. These are visual
references: create original faces, silhouettes, clothing and weapons.
An image prompt mentioning UE5 does not produce a UE5 render, a rigged model,
PBR texture maps or a subsurface-scattering shader.

## API configuration and capability check

This skill is an instruction package, not an installed Mage SDK or active
connection. Mage Space endpoints, authentication, models and supported fields
must be checked against official documentation available to the account.
No working public API contract was verified when this skill was authored;
the environment proxy refused access to www.mage.space (CONNECT 403).
Do not invent an endpoint, model ID, Bearer authentication or request schema.

Configure these **local integration variables**, not presumed provider fields:

| Variable | Meaning |
| --- | --- |
| `MAGE_API_KEY` | Secret supplied through the environment/secret manager, never a document or browser bundle |
| `MAGE_API_BASE_URL` | Official HTTPS API base URL verified from provider documentation |
| `MAGE_API_MODEL` | Account-accessible model ID supporting the required image workflow |

Before calling the service:

1. Verify official API availability, exact generation/upload/status routes,
   authentication header, accepted payload, image limits, usage rights and cost.
   Record the documentation URL/date and adapter field mapping without secrets.
2. Check that the configured host matches the documented API host before sending
   credentials. Never forward credentials to image download hosts or redirects.
3. Map the semantic settings below only to documented fields. Unsupported seed,
   reference-image or relighting controls must be reported, never silently faked.
4. If documentation, API access or credentials are missing, deliver the complete
   prompt package and identify the missing configuration. Do not scrape private
   web endpoints, reuse session cookies or claim that generation succeeded.
5. Honor the session's existing budget authorization. Creating this skill does
   not authorize paid calls; do not consume credits without an applicable mandate.

Use a server-side/local HTTP client with TLS verification, request timeouts and
redacted logs. Do not automatically retry generation POSTs after an ambiguous
timeout: check the documented job status/idempotency mechanism to avoid double
charges. Bound status polling and handle rate limits according to provider docs.
Never embed `MAGE_API_KEY` in `VITE_*`, source code, command arguments or manifests.

## Semantic generation settings

These are artistic controls for the prompt/adapter, **not a Mage API schema**.

```yaml
character:
  id: mythwood-original-character
  role: mage
  age: adult
  identity: fixed face, proportions, hair, costume and equipment across views
style:
  rendering: semi-realistic cinematic game character concept
  references: UE5 material richness; Final Fantasy VII Remake character fidelity
  anatomy: believable adult proportions and expressive original face
skin:
  detail: natural pores, fine wrinkles, subtle roughness variation
  subsurface_scattering: subtle warm translucency at ears, nose and fingers
  avoid: waxy skin, plastic specular response, exaggerated smoothing
lighting:
  turnaround: broad soft studio illumination, neutral white balance, weak shadows
  cinematic: warm key, soft cool fill, restrained rim, preserved skin tones
  key_direction: front-left approximately 45 degrees
  key_to_fill_ratio: approximately 3:1 visual target
  background: neutral mid-gray, no scenery or fog obscuring silhouette
views:
  turnaround: [front_0_degrees, side_90_degrees, back_180_degrees]
  pose: relaxed A-pose, hands and feet visible, weapon separate if occluding body
  camera: orthographic-looking, minimal perspective, consistent scale and eye level
output:
  turnaround_sheet: landscape, three equally sized full-body views
  cinematic_portrait: separate image, same approved identity
  resolution: highest useful documented resolution within authorized budget
  seed: record when supported; same seed alone does not guarantee identity
```

Subsurface scattering, light ratios and orthographic camera here describe the
desired appearance. Unless explicitly supported by the API, express them in
the prompt rather than claiming numeric shader or camera controls exist.

## Workflow

1. Define a short character brief: role, personality, silhouette, face, palette,
   outfit materials, weapon and one recognizable MYTHWOOD motif. Use available
   project context; ask only for information that materially blocks the design.
2. Prepare the neutral turnaround first. Keep cinematic lighting on a separate
   image so deep shadows do not hide modeling reference details.
3. Where documented reference conditioning exists, reuse the approved character
   reference for every angle and relighting pass. Keep costume and proportions
   fixed. Use supported controls for pose/view consistency, not seed alone.
4. If image-to-image/relighting is unavailable, describe the second image as a
   new lighting interpretation; do not claim exact identity preservation or a
   physical relighting operation. If multiple-view generation is unsupported,
   try a prompted sheet only within the budget and inspect consistency explicitly.
5. Inspect actual outputs before calling them usable: correct view orientation,
   matching costume/face/proportions, complete feet/hands, plausible anatomy,
   unclipped silhouette, no accidental text/watermarks. Report mismatches rather
   than treating a front-facing duplicate as a side view. Limit revision batches
   to the authorized credit allowance.
6. Store approved artifacts only in the task's agreed asset directory. Keep a
   secret-free manifest with character ID, prompt, negative prompt if supported,
   actual model/version, actual parameters, seed if returned, view, documentation
   URL/date, provider job ID, license/provenance and observed limitations. Do not
   record signed download URLs or raw responses containing credentials.
7. Update the handoff. Distinguish prompt prepared, API request accepted, image
   downloaded, visually reviewed and owner approved. Never auto-publish.

## Turnaround prompt template

```text
Original MYTHWOOD character design: {adult_character_brief}.
Semi-realistic premium action RPG concept art, believable adult anatomy,
UE5-like material richness and Final Fantasy VII Remake-like character fidelity,
an original design with no existing franchise character likeness.
Three-view modeling reference sheet: full-body front view on the left,
true 90-degree side view in the center, full back view on the right.
The exact same character, costume construction, hair, proportions, accessories
and equipment in every view. Relaxed A-pose, aligned feet and head heights,
uniform scale, minimal perspective, complete uncropped silhouette.
{material_and_palette_brief}. Natural skin pores, subtle roughness variation,
restrained warm subsurface translucency in ears, nose and fingers.
Soft even studio illumination, neutral gray background, clear fabric seams,
armor construction and hair silhouette. No scenery, captions or logos.
```

## Cinematic relighting prompt template

```text
Use the approved original character reference {reference_id}, where supported.
Preserve face, age, silhouette, costume, palette and equipment.
{portrait_or_full_body_composition}, semi-realistic cinematic RPG concept art.
Warm soft key from front-left at approximately 45 degrees, gentle cool fill,
approximately 3:1 key-to-fill visual contrast, restrained rim separating the
silhouette from a neutral mid-gray background. Detailed skin pores, natural
specular highlights and subtle subsurface translucency; no waxy skin.
Physically plausible worn metal, cloth weave and leather. Preserve readable
facial features and shadow detail; no excessive bloom or crushed blacks.
```

If the selected model documents a negative-prompt field, use:

```text
chibi, cartoon toy, plastic skin, waxy face, excessive smoothing, distorted
anatomy, extra limbs, fused fingers, inconsistent outfit between views,
wrong view angle, cropped feet, extreme perspective, illegible silhouette,
text, watermark, logo, copied franchise character
```

If it does not support negative prompts, incorporate the relevant constraints
in the main prompt. Never send unsupported parameters or promise identical
results across models. Final deliverables remain concept images; conversion
to a production game character requires modeling, textures, rigging and testing.
