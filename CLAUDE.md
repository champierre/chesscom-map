# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a Deno TypeScript project that visualizes Chess.com game opponents on a world map. The project fetches Chess.com game archives and displays opponent countries with interactive mapping.

## Project Status

**Complete**: This project is fully implemented and functional as a Deno application.

## Development Context

This project is part of a collection of chess-related projects in the parent
directory, including:

- `chess/` - A larger established project
- `claude-chess/` - Another chess project
- `gpt-chess/` - Additional chess-related project

## Common Development Tasks

- `deno task dev` - Start development server with file watching
- `deno task start` - Start production server
- `deno lint` - Run code linting
- `deno fmt` - Format code
- `deno run --allow-net --allow-read --allow-write server.ts` - Manual server start

## Architecture Notes

The project uses:

- **Backend**: Deno + TypeScript server with Chess.com API integration
- **Frontend**: Vanilla JavaScript with Leaflet.js for interactive world map
- **Data Storage**: Local JSON files with hierarchical organization
- **API**: Chess.com Public API for game archives and player data

Key features:
- Command-line username input on server startup
- Automatic loading of existing data
- Interactive world map with country markers and popups
- Comprehensive support for Chess.com special country codes (XE, XS, XW, etc.)
- Efficient caching and data management
