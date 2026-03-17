# sesh

A Claude Code plugin that automatically names your sessions based on conversation context.

## How it works

After 3 user messages, sesh injects a system prompt that asks Claude to generate a concise session name and set it via `claude session name`. It runs silently — no interruption to your workflow.

## Install

```bash
/plugin marketplace add ibrahemid/sesh
/plugin install sesh@pode-plugins
```

## License

MIT
