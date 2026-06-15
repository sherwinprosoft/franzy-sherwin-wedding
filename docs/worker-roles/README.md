# Wedding Website Worker Roles

Use these files as copy/paste prompts when spawning `agent_type: "worker"` agents for design review and planning work.

Recommended order:

1. `ux-information-architect.md`
2. `visual-designer.md`
3. `content-strategist.md`
4. `frontend-qa-reviewer.md`

Default worker boundaries:

- Treat `/home/sherwinrossora/projects/php/src/franzy_sherwin_wedding` as the project root.
- Review the existing Next.js website and `public/images/1.png`, `public/images/2.png`, and `public/images/3.png` as the visual references.
- Use the intended refreshed palette as design context:
  - `#53583E` deep olive green
  - `#AEA38E` warm taupe
  - `#DDDBD7` soft stone
  - `#593B1F` dark walnut brown
- Do not edit files unless the spawning prompt explicitly overrides that.
- Return concise, implementation-ready recommendations.

Spawn pattern:

```text
Spawn a worker with the contents of docs/worker-roles/<role-file>.md as its task.
Use agent_type: worker.
Do not allow file edits unless implementation is explicitly requested.
```
