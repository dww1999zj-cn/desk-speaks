# GitHub repository profile

Copy the fields below into your repo **About** (gear icon on the right of the GitHub repo page).

## Description

```
Upload a desk photo — get a playful AI persona report from your desk's POV. Next.js 15 + Qwen-VL, bilingual zh/en.
```

## Website

```
https://desk.zeabur.app
```

## Topics

Paste as comma-separated tags (GitHub allows up to 20):

```
nextjs, react, typescript, tailwindcss, ai, computer-vision, qwen-vl, next-intl, personality-test, side-project, zeabur, supabase, vision-language-model, desk-setup, indie-hacker
```

## Pin on profile

On https://github.com/dww1999zj-cn → **Customize your pins** → select **desk-speaks**.

## Demo asset (README)

`docs/demo.gif` is generated from a screen recording (400px wide, 12 fps). To regenerate from `docs/demo.mp4`:

```bash
# requires ffmpeg (or Python imageio-ffmpeg)
ffmpeg -i docs/demo.mp4 -an -vf "fps=12,scale=400:-1:flags=lanczos,palettegen=stats_mode=diff" docs/demo-palette.png
ffmpeg -i docs/demo.mp4 -i docs/demo-palette.png -an -lavfi "fps=12,scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse" docs/demo.gif
```
