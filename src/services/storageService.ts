/**
 * Storage Service
 * 
 * This service handles localStorage operations for persisting application data
 */

import { ReasonMapping } from '../types';
import { REASON_MAPPINGS } from '../data/reasonMappings';

const STORAGE_KEYS = {
  MATCHING_RULES: 'checkmate_matching_rules',
  FILE_HISTORY: 'checkmate_file_history'
};

/**
 * Get matching rules from localStorage or return default rules
 */
export const getMatchingRules = (): ReasonMapping[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHING_RULES);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the structure
      if (Array.isArray(parsed) && parsed.every(rule => 
        typeof rule.searchTerm === 'string' && typeof rule.reason === 'string'
      )) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading matching rules from storage:', error);
  }
  
  // Return default rules if nothing in storage or error occurred
  return [...REASON_MAPPINGS];
};

/**
 * Save matching rules to localStorage
 */
export const saveMatchingRules = (rules: ReasonMapping[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHING_RULES, JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving matching rules to storage:', error);
    throw new Error('Failed to save matching rules');
  }
};

/**
 * Reset matching rules to default values
 */
export const resetMatchingRules = (): ReasonMapping[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.MATCHING_RULES);
    return [...REASON_MAPPINGS];
  } catch (error) {
    console.error('Error resetting matching rules:', error);
    throw new Error('Failed to reset matching rules');
  }
};

/**
 * Add a new matching rule
 */
export const addMatchingRule = (newRule: ReasonMapping): ReasonMapping[] => {
  const currentRules = getMatchingRules();
  
  // Check if rule already exists
  const exists = currentRules.some(rule => 
    rule.searchTerm.toLowerCase() === newRule.searchTerm.toLowerCase()
  );
  
  if (exists) {
    throw new Error('A rule with this search term already exists');
  }
  
  const updatedRules = [...currentRules, newRule];
  saveMatchingRules(updatedRules);
  return updatedRules;
};

/**
 * Update an existing matching rule
 */
export const updateMatchingRule = (
  originalSearchTerm: string, 
  updatedRule: ReasonMapping
): ReasonMapping[] => {
  const currentRules = getMatchingRules();
  
  // Check if the new search term conflicts with another rule (unless it's the same rule)
  if (originalSearchTerm !== updatedRule.searchTerm) {
    const exists = currentRules.some(rule => 
      rule.searchTerm.toLowerCase() === updatedRule.searchTerm.toLowerCase()
    );
    
    if (exists) {
      throw new Error('A rule with this search term already exists');
    }
  }
  
  const updatedRules = currentRules.map(rule => 
    rule.searchTerm === originalSearchTerm ? updatedRule : rule
  );
  
  saveMatchingRules(updatedRules);
  return updatedRules;
};

/**
 * Delete a matching rule
 */
export const deleteMatchingRule = (searchTerm: string): ReasonMapping[] => {
  const currentRules = getMatchingRules();
  const updatedRules = currentRules.filter(rule => rule.searchTerm !== searchTerm);
  saveMatchingRules(updatedRules);
  return updatedRules;
};

export default {
  getMatchingRules,
  saveMatchingRules,
  resetMatchingRules,
  addMatchingRule,
  updateMatchingRule,
  deleteMatchingRule
};