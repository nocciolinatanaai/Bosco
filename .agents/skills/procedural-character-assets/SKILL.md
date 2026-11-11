---
name: procedural-character-assets
description: Write and execute reproducible Python generators with Pillow, NumPy and trimesh for character normal maps, skin and fabric roughness maps, and anatomically proportioned OBJ or GLB base meshes.
---

# Procedural character assets

## Purpose

When invoked to produce assets, **write and execute Python scripts**, inspect
their actual outputs and report measured results. Do not stop at suggesting code.
Generate local procedural material maps and adult humanoid base meshes for
MYTHWOOD. Read AGENTS.md, HANDOFF.md, docs/COLLABORATION.md and the current art
direction first; do not overwrite assigned files or existing approved assets.

Creating this skill alone does not request an asset batch. Procedural generation
does not require an image API or paid service. It is suitable for material studies
and anatomical blockouts, not an automatic replacement for sculpting, retopology,
UV work, rigging or artistic review.

## Environment and reproducibility

1. Inspect the available Python version and imports `PIL`, `numpy`, `trimesh`.
   Use a task-local virtual environment if dependencies are missing; install with
   `python -m pip`, record resolved versions, and avoid global package changes.
   A missing optional Boolean/remeshing backend must be reported explicitly.
2. Store generators in a task-agreed tools directory and exploratory outputs in
   test-results, outside shipped assets until reviewed. Use pathlib, explicit
   output directories, no overwrites by default and deterministic file names.
3. Provide argparse options for seed, resolution, material type, normal strength,
   character height, anatomical proportions, mesh detail, output path and format.
   Validate finite values and bounds before allocating arrays or mesh buffers.
4. Use `numpy.random.default_rng(seed)`. Record seed, full parameters, dependency
   versions, coordinate conventions, output hashes and validation results in a
   secret-free manifest. Avoid per-pixel Python loops; vectorize with NumPy.
   For 4K maps process buffers sequentially or in tiles to control memory.
5. Run the script using exec tools with a bounded timeout, inspect its exit status
   and generated files, then run the checks below. Fix failures rather than
   describing unexecuted code as a successful generation. Do not spend credits,
   publish, deploy or modify production services as part of this skill.

Suggested generator interface (create the script before running these commands):

```sh
python tools/character-assets/generate.py textures --material skin --size 1024 --seed 42 --out test-results/character-assets/skin
python tools/character-assets/generate.py textures --material fabric --size 1024 --seed 43 --out test-results/character-assets/fabric
python tools/character-assets/generate.py mesh --height-m 1.78 --head-count 7.5 --format glb --out test-results/character-assets/body
```

## Normal maps from procedural height fields

Build height fields in float32 before conversion to an image:

- Skin: periodic multiscale low-amplitude noise, sparsely distributed pore
  depressions, directional fine creases and restrained broad variation. Avoid
  uniform dots, exaggerated craters or random white noise at every pixel.
- Fabric: periodic warp/weft height profiles, a declared weave repeat count,
  thread-scale variation and controlled imperfections. Distinguish coarse linen
  from fine woven cloth using scale and anisotropy, not just a color change.
- Use a documented repeatable noise method (for example filtered periodic Fourier
  noise). Periodic source fields and wrapped derivatives permit tiling; unrelated
  random noise on opposite edges does not. Choose weave frequencies compatible
  with the tile period and apply wrapping to all localized features.

Define UV orientation explicitly: image columns increase with U; image rows
increase downward, opposite to V. For a square tile with height in a declared
normalized tile unit, this is a valid OpenGL tangent-space construction:

```python
du = (np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)) * (width / 2)
dv = -(np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)) * (height_px / 2)
n = np.stack((-strength * du, -strength * dv, np.ones_like(height)), axis=-1)
n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-8)
if convention == 'directx':
    n[..., 1] *= -1
rgb = np.rint(np.clip(n * 0.5 + 0.5, 0, 1) * 255).astype(np.uint8)
Image.fromarray(rgb).save(output_path)
```

Here `height` is the 2D array and `height_px, width = height.shape`; use distinct
variable names for anatomical height, height field and pixel dimensions. Scale
derivatives by the declared physical/UV tile extent for nonsquare tiles. Never
convert a grayscale height image directly into RGB and call it a normal map.

Export RGB PNG, OpenGL +Y by default, declared linear data, with no sRGB transfer
applied. A flat surface should decode approximately to (0, 0, 1), encoded
(128, 128, 255). Preserve consistent normal strength when resolution changes.
Normal maps represent fine surface relief, not skin subsurface scattering.

## Skin and fabric roughness

Generate independently controlled spatial roughness, with meaningful optional
correlation to pores/thread structure. Roughness must not be inferred directly
from albedo luminance or the normal map's blue channel.

- Skin starting range: 0.35–0.65 with smooth low-frequency variation and subtle
  pore modulation. These are artistic defaults, not measured biological data.
  Do not invent face-specific oily regions without an anatomical UV layout.
- Fabric starting range: 0.65–0.9 with restrained weave-scale variation; customize
  for the brief. Silk, leather and metal require their own material choices.
- Black means smooth, white rough. Export standalone grayscale PNG as linear
  data; quantize only at export. No painted illumination, baked highlights or
  color-management transform belongs in these scalar maps.
- Standalone grayscale maps used as Three.js roughnessMap must replicate values
  into RGB on sampling, since that material reads G. Packed ORM uses G=roughness;
  do not silently change the channel layout. Record it in the manifest.

These tileable studies are not character-specific UV maps. Record intended texel
density and tile dimensions. Baking to an anatomical atlas requires a UV-mapped
mesh and explicit reprojection; do not claim that step happened automatically.

## Semi-realistic anatomical base meshes

Use trimesh to construct an original adult humanoid with configurable landmarks.
Default: 1.78 m tall, approximately 7.5 head heights; allow different adult body
types instead of presenting one ratio as universal. Proportion parameters should
control head size, shoulder/pelvis width, torso/leg balance and limb thickness.

Define a landmark table in meters before creating geometry: pelvis, spine,
sternum, neck, skull, shoulders, elbows, wrists, hips, knees, ankles and feet.
Place elbows near waist level and wrists near upper thighs as starting checks;
check leg/arm segment lengths and joint alignment in front and side views.
Use a neutral relaxed A-pose, mirrored limb placement and separate joint centers.

Build tapered limb segments with circular/elliptical rings, shaped torso/pelvis
lofts, a proportioned cranium/jaw and readable hand/foot masses. Orient segments
along landmark vectors using robust transforms; handle zero-length segments.
Vary cross-sections for muscles/joints instead of using uniform cylinders.
Avoid heroic oversizing unless explicitly requested. Hands, feet and face can
remain simplified, but must be identified as blockout geometry.

`trimesh.util.concatenate` joins arrays, **not surfaces**. Overlapping closed
primitives are not a continuous manifold body. Either label the result a segmented
blockout or perform an explicitly supported union/remesh and check its output.
Do not claim animation-ready topology, watertightness, UVs, rigging or meaningful
material zones unless actually constructed and verified. Voxel remeshing can
destroy fingers/joint detail and is not automatic production retopology.

Export:

- GLB: self-contained binary glTF, Y up, meters, front +Z as the project convention.
  Transform trimesh source geometry to those axes before export; record the
  conversion. Use named nodes and a neutral opaque material. Preserve normals.
- OBJ: geometry and normals, explicitly documented Y-up/meters convention (OBJ
  does not enforce units). Include MTL only if authored; don't promise embedded
  textures. Export UV coordinates only when a valid UV layout exists.

If UVs are absent, deliver maps as separate material studies and mark texture
binding blocked. Do not generate arbitrary UVs that make a screenshot pass while
stretching skin across joints. Reimport every exported file with trimesh and
compare dimensions, bounds and geometry counts to the source.

## Required validation and visual review

Run low-resolution smoke generation before high-resolution batches. Check:

1. Files exist, PNGs reopen with expected dimensions/modes; values are finite and
   roughness stays within the declared range with nonzero variation.
2. Decoded normals are approximately unit length (allow 8-bit quantization).
   Flat height gives +Z and a known U/V ramp has the expected normal sign.
   Compare same-parameter outputs at two resolutions for consistent strength.
3. Tiling: inspect a repeated 2×2 preview and edge derivative transitions.
   Periodic samples need not have identical first/last pixel values; assess edge
   differences against ordinary neighboring-pixel differences, not exact equality.
4. Mesh vertices/faces are finite and valid, triangles have nonzero area, bounds
   match requested anatomical height within documented tolerance. Report face
   count, connected components, winding and watertightness as observed, not assumed.
5. The same seed/config produces matching pixel/geometry arrays in the recorded
   environment; binary export metadata may differ. Reimport OBJ/GLB successfully.
6. Render normal/roughness studies on a lit sphere or UV-mapped test surface and
   the mesh from front, side and back using available local tools. Compare under
   consistent lighting, with wireframe/joint landmarks when useful. If no renderer
   is available, report visual review pending instead of declaring art approved.

For automated repeated production, keep useful numerical tests for derivative
signs, degeneracy and exports; do not add application gameplay tests for a
documentation-only skill. Use Pillow for authorized procedural synthesis and
inspection previews, not unrelated edits to user-provided images.

## Handoff

Deliver generator paths, exact executed commands, seed/dependency manifest,
texture dimensions/conventions, mesh statistics, exports, previews and failures.
Separate generated, numerically validated, visually reviewed and owner-approved
statuses. Document remaining UV, topology, sculpting, rigging and SSS work.
Integrate into gameplay only as a separately verified task. Update HANDOFF.md
and share commits only within the current branch authorization.
