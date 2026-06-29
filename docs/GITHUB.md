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

`docs/demo-preview.mp4` (~70 KB) is used in README for fast loading. Regenerate from `docs/demo.mp4`:

```bash
ffmpeg -i docs/demo.mp4 -an -vf "scale=280:-1:flags=lanczos" -c:v libx264 -crf 30 -preset slow -movflags +faststart -pix_fmt yuv420p docs/demo-preview.mp4
```
