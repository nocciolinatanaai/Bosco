---
name: agensi-gamedev-characters
description: Coordinate parallel production of semi-realistic character concepts, PBR specifications and a Three.js material importer, checking official Agensi marketplace requirements before claiming compliance.
---

# Character asset production — MYTHWOOD / Agensi

## Contract and provenance

Use for original semi-realistic character packages. Read AGENTS.md, HANDOFF.md,
docs/COLLABORATION.md and docs/ENEMY_ART_DIRECTION.md. Preserve assigned files.
This skill automates the production workflow when invoked by an agent; installing
it does not start a background service, connect an image API or generate assets.

**Agensi requirements are not verified.** No official Game Dev Marketplace
specification was supplied; the attempted agensi.io request was blocked by the
environment proxy (CONNECT 403). That URL is not proof of the marketplace's
identity. Obtain the official marketplace/specification URL or supplied document,
verify ownership, version/date, submission rules, naming, formats, licensing,
AI disclosure and engine support before claiming compliance. The requirements
below are MYTHWOOD production defaults, not attributed Agensi standards. Record
`marketplaceCompliance: unverified` until a requirement-by-requirement audit
against an official source passes. Do not invent an Agensi API or certification.

## Inputs and shared contract

Resolve from project context: character ID, adult identity/anatomy, class,
silhouette, palette, costume construction, reference rights and intended device.
Default engine: the repository's Three.js version, not Unreal Engine just because
UE5 is an artistic reference. Read package.json before generating engine code.

Create one immutable task contract before parallel work: asset ID, brief revision,
reference IDs, intended material slots, engine/version, UV availability, output
directory, approved provider/budget and required sizes. All jobs consume that
same revision. Missing UV/model information makes the PBR document provisional,
not a reason to fabricate a finished texture set.

Suggested output, under a task-agreed directory outside runtime code:

```text
<character-id>/
  manifest.json
  concept/character.png
  concept/turnaround.png
  pbr-spec.json
  import-character.mjs
  review.md
```

## Three parallel deliverables

After the shared contract is frozen, start these independent jobs concurrently
using available async tools (for example Promise.allSettled). Each owns distinct
outputs. Use sub-agents only when authorized by the session's delegation rules;
parallel tools do not require them. Inspect every result before integration.
No runtime import depends on unfinished concept output. Revise all affected
outputs together if the shared brief changes.

### 1. High-resolution 2D concept

Use mage-character-gen when available and an officially documented authorized
provider is configured. Otherwise prepare prompts and report generation blocked;
never substitute a claimed successful API call. Respect existing spending limits.

Target: original semi-realistic premium RPG character, believable adult anatomy,
natural skin pores, subtle subsurface translucency, worn materials and readable
silhouette. UE5 / Final Fantasy VII Remake are fidelity references, not characters
to reproduce or claims about the rendering engine.

Produce a cinematic full-body concept and neutral front/side/back turnaround.
Aim for 4096 px on the long edge when supported and budgeted; record actual native
dimensions and any upscaling, never call an upscale native 4K. Keep cinematic
relighting separate from evenly illuminated modeling references. Preserve face,
equipment, proportions and clothing between views; inspect actual images.

### 2. PBR texture specifications

Write pbr-spec.json with per-material slot, dimensions, UV set, filename, channel
meaning, color space, precision, workflow and missing prerequisites. Defaults:

| Map | Meaning | Encoding / conventions |
| --- | --- | --- |
| Albedo / Base Color | Surface color, no baked lighting, shadows or specular | RGB sRGB; optional alpha explicitly specified |
| Normal | Tangent-space micro/surface normals | RGB linear data, OpenGL +Y; document DirectX -Y conversion if needed |
| Roughness | Microfacet roughness, black smooth / white rough | R linear data; standalone grayscale replicated RGB for Three.js roughnessMap's G channel |
| Subsurface | Explicitly defined scattering/thickness control | R linear data, authored meaning and units; not a generic color layer |

Authoring default: 2048 square per material set; 4096 skin close-up only when
justified. Browser/mobile export default: 1024/2048 after visual and memory checks.
Use lossless PNG for interchange; texture compression is a separate validated
export step. Record quantization and memory costs including mipmaps. Different
resolutions are allowed per map when documented. Avoid unnecessary transparent
materials, draw calls and 4K maps for distant characters.

Declare metalness per slot (skin/cloth 0, actual metal appropriately authored).
Do not treat leather as metallic. If using packed ORM, specify R=AO, G=roughness,
B=metalness and generate a matching importer; the bundled template instead uses
standalone maps. Check UV alignment, seams, tangent handedness, scale and absence
of illumination in albedo on the real model. A concept image is not UV-aligned
PBR data. This deliverable is a **specification**, not generated texture files.

**Subsurface limitation:** Three.js MeshPhysicalMaterial does not expose a native
skin `subsurfaceMap`. `transmission` is not skin subsurface scattering. Preserve
the map's semantics in the manifest and importer metadata; use the opaque PBR
fallback until a separately tested scattering shader exists. Do not silently map
Subsurface to opacity, emissive, transmission or thickness without a documented
compatible shader model.

### 3. Ready-to-use engine import script

Copy `templates/import-character.mjs` from this skill, then specialize its manifest
for the intended model/material names. It loads GLB/glTF using Three.js GLTFLoader,
loads standalone PNG maps, assigns color spaces and glTF texture orientation,
preserves material arrays, and reports unsupported subsurface data explicitly.
It does not invent a mesh from the 2D concept or modify the existing game scene.
For Draco/KTX2 assets configure the required loaders explicitly; the template
assumes ordinary GLB/glTF plus image textures. Assets must have usable UVs.

Generated config example (paths are placeholders, not existing assets):

```js
const config = {
  modelUrl: '/characters/example/character.glb',
  materials: [{
    sourceMaterial: 'Skin',
    albedo: '/characters/example/skin_albedo.png',
    normal: '/characters/example/skin_normal.png',
    roughness: '/characters/example/skin_roughness.png',
    subsurface: '/characters/example/skin_subsurface.png',
    normalConvention: 'opengl',
    metalness: 0,
  }],
};
const { importCharacter } = await import('./import-character.mjs');
const { gltf, warnings } = await importCharacter(config);
scene.add(gltf.scene);
console.info(warnings); // no secrets or signed URLs
```

Use explicit material-name matching; fail for missing slots instead of silently
replacing every material. Preserve the model's rig/animation clips. Configure
scene lighting/environment separately for material validation. The owning caller
must dispose created materials/textures when unloading, and handle loader errors.

## Join, validation and handoff

Wait for all three jobs and inspect failures; do not mark a partially generated
package complete. Produce a secret-free manifest with revision, status per output
(planned/generated/validated/blocked), actual dimensions, provider/model/seed when
available, provenance/license, AI disclosure, UV/model dependency and official
Agensi requirement evidence or `unverified`. Never record API keys/signed URLs.

Validate script syntax and run it against an actual local model in a browser
when assets exist. Check multi-material assignments, correct color/normal maps,
negative/mirrored UV issues, console errors and resource cleanup. Capture front,
side and back under neutral light plus the cinematic view. Report exact test
commands/results; syntax validation alone is not a successful model import.

Keep concept quality, texture availability, importer readiness, visual review and
marketplace compliance as separate statuses. Update HANDOFF with outputs, limits
and next action; commit/push only within current authorization. No automatic
marketplace upload, deployment, social publication, paid generation or production
service changes are implied by this skill.
