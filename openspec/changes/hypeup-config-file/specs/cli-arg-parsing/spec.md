## MODIFIED Requirements

### Requirement: CLI parses named flags
The CLI SHALL parse `--flag value` and `--flag=value` style arguments following the subcommand. Boolean flags (e.g., `--clean`) SHALL be treated as `true` when present. Unknown flags SHALL be ignored. When a config file is present, CLI flags SHALL override config file values for the same option.

#### Scenario: Flag with space-separated value
- **WHEN** the user runs `hypeup generate --out build`
- **THEN** the CLI SHALL parse `out` as `"build"`

#### Scenario: Flag with equals-separated value
- **WHEN** the user runs `hypeup generate --out=build`
- **THEN** the CLI SHALL parse `out` as `"build"`

#### Scenario: Boolean flag
- **WHEN** the user runs `hypeup generate --clean`
- **THEN** the CLI SHALL parse `clean` as `true`

#### Scenario: Flag overrides config file
- **WHEN** the config file specifies `{ out: "build" }` and the user passes `--out dist`
- **THEN** the resolved value for `out` SHALL be `"dist"`
