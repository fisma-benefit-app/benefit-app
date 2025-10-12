# Centralized Calculations System

## Overview

The `centralizedCalculations.ts` file provides a unified, performant approach to handling all functional point calculations across the application. This system consolidates previously scattered calculation logic and adds performance optimizations through memoization.

## Key Benefits

### 🚀 Performance Optimizations
- **Memoization**: Expensive calculations are cached using component-specific keys
- **Batch Operations**: Efficient bulk calculation methods for multiple components
- **Optimized Iterations**: Uses `Set` for unique value operations and optimized loops

### 🧹 Code Organization
- **Single Source of Truth**: All calculation logic in one place
- **Reduced Verbosity**: Simple function calls instead of repeated calculation logic
- **Type Safety**: Full TypeScript support with proper type definitions

### 🔧 Easy Maintenance
- **Centralized Updates**: Changes to calculation logic only need to be made in one place
- **Cache Management**: Built-in cache clearing and monitoring capabilities
- **Validation Helpers**: Functions to check component calculation readiness

## Key Functions

### Core Calculation Functions
```typescript
// Calculate base points (without degree of completion)
calculateBasePoints(component: TGenericComponent): number

// Calculate points with degree of completion
calculateComponentPoints(component: TGenericComponent): number

// Calculate with custom multiplier (used in reports)
calculateComponentPointsWithMultiplier(component: TGenericComponent | null, multiplier: number | null): number

// Calculate total points for multiple components
calculateTotalPoints(components: TGenericComponent[]): number

// Calculate total possible points (if all components were 100% complete)
calculateTotalPossiblePoints(components: TGenericComponent[]): number
```

### Utility Functions
```typescript
// Group components for summary displays
getGroupedComponents(components: TGenericComponent[])

// Get components with calculated points for export
calculateComponentsWithPoints(components: TGenericComponent[])

// Validation helpers
hasValidCalculationParams(component: TGenericComponent): boolean
getCalculableComponents(components: TGenericComponent[]): TGenericComponent[]
```

### Performance Management
```typescript
// Cache management
clearCalculationCache(): void
getCacheSize(): number
```

## Migration Impact

### Files Refactored
- ✅ `FunctionalClassComponent.tsx` - Now uses `calculateBasePoints()` and `calculateComponentPoints()`
- ✅ `FunctionalPointSummary.tsx` - Uses `calculateTotalPoints()`, `getGroupedComponents()`, and `calculateComponentsWithPoints()`
- ✅ `printUtils.ts` - Uses `calculateComponentPointsWithMultiplier()` and `calculateTotalPoints()`

### Performance Improvements
- **Reduced Redundancy**: Eliminated duplicate calculation logic across multiple files
- **Memoization Cache**: Calculations are cached and reused for identical component states
- **Optimized Grouping**: Uses `Set` operations for better performance when grouping components

## Usage Examples

### Basic Component Calculation
```typescript
import { calculateComponentPoints } from '../lib/centralizedCalculations';

const points = calculateComponentPoints(component);
```

### Total vs Possible Points
```typescript
import { calculateTotalPoints, calculateTotalPossiblePoints } from '../lib/centralizedCalculations';

// Current total (with degree of completion applied)
const currentTotal = calculateTotalPoints(project.functionalComponents);

// Maximum possible total (if all components were 100% complete)
const possibleTotal = calculateTotalPossiblePoints(project.functionalComponents);

// Calculate completion percentage
const completionPercentage = (currentTotal / possibleTotal) * 100;
```

### Bulk Operations
```typescript
import { calculateTotalPoints, batchCalculateComponentPoints } from '../lib/centralizedCalculations';

// Calculate total for all components
const totalPoints = calculateTotalPoints(project.functionalComponents);

// Get individual points for all components efficiently
const allPoints = batchCalculateComponentPoints(project.functionalComponents);
```

### Export with Points
```typescript
import { calculateComponentsWithPoints } from '../lib/centralizedCalculations';

const componentsWithPoints = calculateComponentsWithPoints(project.functionalComponents);
downloadCSV(componentsWithPoints);
```

## Cache Strategy

The memoization system uses component-specific keys that include:
- Component ID
- Class name
- Component type  
- All calculation parameters (dataElements, readingReferences, etc.)
- Degree of completion

This ensures calculations are only re-computed when actual component data changes.

## Future Enhancements

The centralized system makes it easy to add:
- Different calculation algorithms
- A/B testing of calculation methods
- Performance monitoring and analytics
- Bulk operations and optimizations
- Calculation history and auditing