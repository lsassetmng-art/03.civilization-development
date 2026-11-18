# GameOS Button Menu Shell Presenter Contract

## Purpose

This contract defines the button-menu shell used by GameOS surfaces.

The top-level landing surface is GameOS Home.

Game Builder is not the top-level home. Game Builder is one button and function group inside GameOS Home.

## GameOS Home buttons

- Game Builder
- Marketplace
- Creator Store
- Purchases
- Recent Projects
- Settings

## Game Builder buttons

- Continue Project
- New Project
- Open Project
- Template Gallery
- Project Overview

## Project Overview buttons

- World
- Scenario
- Characters
- Persona Link
- Scenes
- Dialogue / Choices
- Variables / Flags
- Assets
- Monetization
- Preview / Playtest
- Save / Revision History
- Export / Publish
- Publish to Marketplace

## Official genre buttons

- Visual Novel
- Dating Simulation
- RPG
- Puzzle
- Strategy
- Action Game
- Adventure Game
- 2D Fighting Game

## Marketplace buttons

- Browse Games
- Browse Skins
- Browse Backgrounds
- Browse Asset Packs
- Browse Templates
- Browse DLC
- Browse In-game Items
- Search
- Product Detail
- Purchase
- Add to Library

## Creator Store buttons

- Seller Dashboard
- Create Product Listing
- Manage Game Listings
- Manage Skin Listings
- Manage Background Listings
- Manage Asset Pack Listings
- Manage DLC Listings
- Manage In-game Item Listings
- Publish Product
- Unpublish Product
- Sales Summary

## Purchases buttons

- My Games
- My Skins
- My Backgrounds
- My Asset Packs
- My Templates
- My DLC
- My In-game Items
- Entitlements

## Button state

Every button must expose one of:

- enabled
- disabled_missing_context
- disabled_permission_required
- disabled_project_required
- disabled_not_implemented
- error_state

## BusinessOS boundary

GameOS presents marketplace products and game entitlements.

BusinessOS owns payment, billing, settlement, seller accounting, and business revenue records.
