<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep LeaseLens as a frontend-only TanStack route application with typed local mock data behind `analysisService`; this preserves a clean future backend seam without introducing network or server behavior.
- Keep shared demo progress in a client-side React provider persisted to localStorage; this makes the demonstration continuous across routes while remaining backend-free.
