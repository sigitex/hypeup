## ADDED Requirements

### Requirement: CLI entry point parses subcommands
The CLI SHALL accept a subcommand as the first positional argument after `hypeup`. The CLI SHALL route to the corresponding subcommand handler. If no subcommand is provided, the CLI SHALL print a usage summary and exit with code 0.

#### Scenario: Valid subcommand is provided
- **WHEN** the user runs `hypeup generate`
- **THEN** the CLI SHALL invoke the `generate` subcommand handler

#### Scenario: No subcommand is provided
- **WHEN** the user runs `hypeup` with no arguments
- **THEN** the CLI SHALL print a usage summary listing available subcommands and exit with code 0

#### Scenario: Unknown subcommand is provided
- **WHEN** the user runs `hypeup unknown-cmd`
- **THEN** the CLI SHALL print an error message indicating the subcommand is not recognized, print the usage summary, and exit with code 1

### Requirement: CLI parses named flags
The CLI SHALL parse `--flag value` and `--flag=value` style arguments following the subcommand. Boolean flags (e.g., `--clean`) SHALL be treated as `true` when present. Unknown flags SHALL be ignored.

#### Scenario: Flag with space-separated value
- **WHEN** the user runs `hypeup generate --out build`
- **THEN** the CLI SHALL parse `out` as `"build"`

#### Scenario: Flag with equals-separated value
- **WHEN** the user runs `hypeup generate --out=build`
- **THEN** the CLI SHALL parse `out` as `"build"`

#### Scenario: Boolean flag
- **WHEN** the user runs `hypeup generate --clean`
- **THEN** the CLI SHALL parse `clean` as `true`

### Requirement: CLI displays version
The CLI SHALL support a `--version` flag that prints the package version and exits with code 0.

#### Scenario: Version flag
- **WHEN** the user runs `hypeup --version`
- **THEN** the CLI SHALL print the version from `package.json` and exit with code 0
