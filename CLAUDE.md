# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a new JavaScript project related to Chess.com functionality. The project is currently uninitialized and requires setup.

## Project Status

**Important**: This project is brand new and has not been initialized. Before starting development:

1. Initialize the project with `npm init` or `yarn init`
2. Set up version control with `git init`
3. Install necessary dependencies based on the specific requirements

## Development Context

This project is part of a collection of chess-related projects in the parent directory, including:
- `chess/` - A larger established project
- `claude-chess/` - Another chess project
- `gpt-chess/` - Additional chess-related project

Consider examining these sibling projects for patterns and conventions that might be relevant.

## Common Development Tasks

Since this is an uninitialized project, common tasks will need to be established after initial setup. Typical JavaScript project commands would include:

- `npm install` or `yarn install` - Install dependencies (after package.json is created)
- `npm run dev` or `yarn dev` - Start development server (needs configuration)
- `npm test` or `yarn test` - Run tests (requires test framework setup)
- `npm run lint` or `yarn lint` - Run linting (requires ESLint setup)
- `npm run build` or `yarn build` - Build for production (needs build configuration)

## Architecture Notes

The project structure will depend on its specific purpose. Based on the name "chesscom-map", this might involve:
- Chess.com API integration
- Data visualization or mapping functionality
- Game analysis or player statistics

Future architecture decisions should be documented here as the project develops.

### Project Logging
* Use vibelogger library for all logging needs
* vibelogger instruction: https://github.com/fladdict/vibe-logger/blob/main/README.md
* Check ./logs/<project_name>/ folder for debugging data when issues occur
