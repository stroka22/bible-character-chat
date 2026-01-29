import { supabase } from '../services/supabase';
// Local fallback when Supabase is unavailable
import { mockCharacterData } from '../data/mockCharacters';
import { getSafeAvatarUrl } from '../utils/imageUtils';
export const characterRepository = {
    sanitizeCharacter(character) {
        if (!character)
            return character;
        const sanitized = { ...character };
        if (sanitized.avatar_url) {
            sanitized.avatar_url = getSafeAvatarUrl(sanitized.name, sanitized.avatar_url);
        }
        if (sanitized.feature_image_url) {
            sanitized.feature_image_url = getSafeAvatarUrl(sanitized.name, sanitized.feature_image_url);
        }
        return sanitized;
    },
    sanitizeCharacters(characters) {
        return characters.map(char => this.sanitizeCharacter(char));
    },
    async getAll(isAdmin = false) {
        const TIMEOUT_MS = 6000; // Ensure UI doesn't hang if network/CORS blocks requests
        try {
            // Build query conditionally instead of using the (non-existent) .modify helper
            let query = supabase.from('characters').select('*');
            /* ------------------------------------------------------------------
             * Respect visibility for non-admin users:
             *   • show rows where is_visible is TRUE
             *   • keep legacy rows where the column is NULL
             * Admin / super-admin users receive the full list.
             * ------------------------------------------------------------------ */
            if (!isAdmin) {
                query = query.or('is_visible.is.null,is_visible.eq.true');
            }

            // Wrap the Supabase request in a timeout so we can gracefully fall back on slow/failing devices
            const fetchPromise = (async () => {
                const { data, error } = await query.order('name');
                if (error) throw error;
                return data;
            })();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT: characters fetch exceeded 6s')), TIMEOUT_MS)
            );

            const data = await Promise.race([fetchPromise, timeoutPromise]);
            return this.sanitizeCharacters(data);
        }
        catch (error) {
            console.error('Failed to fetch characters from Supabase. Falling back to mock data...', error);
            try {
                const data = await mockCharacterData.getAll();
                return this.sanitizeCharacters(data);
            }
            catch (mockErr) {
                console.error('Fallback to mock data failed:', mockErr);
                throw new Error('Failed to fetch characters. Please try again later.');
            }
        }
    },
    async getById(id) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            return this.sanitizeCharacter(data);
        }
        catch (error) {
            console.error(`Failed to fetch character with ID ${id} from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockCharacterData.getById(id);
                return this.sanitizeCharacter(data);
            }
            catch (mockErr) {
                console.error('Fallback to mock data failed:', mockErr);
                throw new Error('Failed to fetch character. Please try again later.');
            }
        }
    },
    async getByName(name) {
        try {
            // First try exact match (case-insensitive)
            let { data, error } = await supabase
                .from('characters')
                .select('*')
                .ilike('name', name)
                .limit(1);
            if (error) {
                throw error;
            }
            
            // If no exact match, try partial match (name starts with the search term)
            // This handles cases like searching "Paul" finding "Paul, The Apostle to the Gentiles"
            if (!data || data.length === 0) {
                const result = await supabase
                    .from('characters')
                    .select('*')
                    .ilike('name', `${name}%`)
                    .limit(1);
                data = result.data;
                error = result.error;
                if (error) {
                    throw error;
                }
            }
            
            // Return first match or null if no results
            if (!data || data.length === 0) {
                return null;
            }
            return this.sanitizeCharacter(data[0]);
        }
        catch (error) {
            console.error(`Failed to fetch character with name ${name} from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockCharacterData.getByName(name);
                return this.sanitizeCharacter(data);
            }
            catch (mockErr) {
                console.error('Fallback to mock data failed:', mockErr);
                throw new Error('Failed to fetch character. Please try again later.');
            }
        }
    },
    async search(query, isAdmin = false) {
        try {
            let q = supabase
                .from('characters')
                .select('*')
                .ilike('name', `%${query}%`);
            if (!isAdmin) {
                q = q.or('is_visible.is.null,is_visible.eq.true');
            }
            const { data, error } = await q.order('name');
            if (error) {
                throw error;
            }
            return this.sanitizeCharacters(data);
        }
        catch (error) {
            console.error(`Failed to search characters with query "${query}" from Supabase. Falling back to mock data...`, error);
            try {
                const data = await mockCharacterData.search(query);
                return this.sanitizeCharacters(data);
            }
            catch (mockErr) {
                console.error('Fallback to mock data failed:', mockErr);
                throw new Error('Failed to search characters. Please try again later.');
            }
        }
    },
    async createCharacter(character) {
        try {
            const sanitizedCharacter = {
                ...character,
                avatar_url: character.avatar_url ?
                    getSafeAvatarUrl(character.name, character.avatar_url) :
                    character.avatar_url,
                feature_image_url: character.feature_image_url ?
                    getSafeAvatarUrl(character.name, character.feature_image_url) :
                    character.feature_image_url
            };
            const { data, error } = await supabase
                .from('characters')
                .insert(sanitizedCharacter)
                .select('*')
                .single();
            if (error) {
                throw error;
            }
            return this.sanitizeCharacter(data);
        }
        catch (error) {
            console.error('Failed to create character:', error);
            throw new Error('Failed to create character. Please try again later.');
        }
    },
    async updateCharacter(id, updates) {
        try {
            console.log('🚨 [DEBUG] Starting character update process');
            console.log(`🚨 [DEBUG] Character ID: ${id}`);
            console.log('🚨 [DEBUG] Incoming payload:', JSON.stringify(updates, null, 2));

            /* ------------------------------------------------------------
             * Build update object with ONLY defined fields
             * ------------------------------------------------------------ */
            const updateData = { updated_at: new Date().toISOString() };

            const allowedFields = [
                'name',
                'description',
                'avatar_url',
                'feature_image_url',
                'bible_book',
                'opening_line',
                'persona_prompt',
                'scriptural_context',
                'is_visible',
                // Character insights
                'timeline_period',
                'historical_context',
                'geographic_location',
                'key_scripture_references',
                'theological_significance',
                'relationships',
                'study_questions'
            ];

            allowedFields.forEach((field) => {
                if (updates[field] !== undefined) {
                    updateData[field] = updates[field];
                }
            });

            console.log('🚨 [DEBUG] Attempting full update with:', JSON.stringify(updateData, null, 2));

            /* ------------------------------------------------------------
             * Perform the update
             * ------------------------------------------------------------ */
            const { data, error } = await supabase
                .from('characters')
                .update(updateData)
                .eq('id', id)
                // Return only a minimal projected set so we avoid large payloads
                // and switch to maybeSingle() to prevent a 406 error when 0 rows
                // are affected (RLS filtered or wrong ID).
                .select('id,name,updated_at')
                .maybeSingle();

            if (error) {
                // ------------------------------------------------------------------
                //  Provide richer diagnostics so we can see exactly why Supabase
                //  rejected the update (field validation, RLS, etc.)
                // ------------------------------------------------------------------
                console.error('🚨 [DEBUG] Update failed:', error);
                console.error('🚨 [DEBUG] Error message:', error.message);
                console.error('🚨 [DEBUG] Error code:', error.code);
                console.error('🚨 [DEBUG] Error details:', error.details);
                console.error('🚨 [DEBUG] Error hint:', error.hint);
                // Error objects from PostgREST can contain circular refs—stringify
                // defensively inside a try/catch.
                try {
                    console.error('🚨 [DEBUG] Full error object:', JSON.stringify(error, null, 2));
                } catch (stringifyErr) {
                    console.error('🚨 [DEBUG] Unable to stringify full error object:', stringifyErr);
                }
                throw error;
            }

            /* ------------------------------------------------------------
             * No rows updated — likely permission issue or bad ID
             * ------------------------------------------------------------ */
            if (!data) {
                console.warn(
                    '🚨 [DEBUG] Update returned zero rows. This usually means the row',
                    'was not found OR RLS prevented the update.'
                );
                throw new Error(
                    'No rows updated. You may not have permission or the character was not found.'
                );
            }

            console.log('🚨 [DEBUG] Update succeeded!', data);
            return this.sanitizeCharacter(data);

        } catch (error) {
            console.error(`🚨 [DEBUG] Error in updateCharacter for ${id}:`, error);
            throw new Error('Failed to update character. Please try again later.');
        }
    },
    async deleteCharacter(id) {
        try {
            const { error } = await supabase
                .from('characters')
                .delete()
                .eq('id', id);
            if (error) {
                throw error;
            }
        }
        catch (error) {
            console.error(`Failed to delete character ${id}:`, error);
            throw new Error('Failed to delete character. Please try again later.');
        }
    },
    async bulkCreateCharacters(characters) {
        if (characters.length === 0)
            return [];
        try {
            // Helper – ensure relationships is always a plain object or null
            const ensureJsonObject = (value) => {
                if (value === undefined || value === null || value === '') {
                    return null;
                }
                if (typeof value === 'object') {
                    return value;
                }
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    console.warn('[characterRepository.bulkCreateCharacters] Failed to parse relationships JSON – defaulting to null.', {
                        relationships: value,
                        error: e
                    });
                    return null;
                }
            };

            // Filter function to keep only known fields that exist in the database schema
            const filterKnownFields = (char) => {
                // List of known fields that exist in the database
                const knownFields = [
                    'name',
                    'description',
                    'persona_prompt',
                    'testament',            // new | old
                    'is_visible',
                    'avatar_url',
                    'feature_image_url',
                    'opening_line',
                    'bible_book',
                    'relationships',
                    // --- Character Insights fields (additions) ---
                    'timeline_period',
                    'historical_context',
                    'geographic_location',
                    'key_scripture_references',
                    'theological_significance',
                    'study_questions',
                    'scriptural_context',
                    // v2 extended / array-json fields (safe to ignore if absent)
                    'key_events',
                    'character_traits',
                    'updated_at'
                ];
                
                // Create a new object with only the known fields
                const filtered = {};
                knownFields.forEach(field => {
                    if (field in char) {
                        filtered[field] = char[field];
                    }
                });
                
                return filtered;
            };

            const sanitizedCharacters = characters.map(char => {
                // First apply standard sanitization (avatar URLs, etc.)
                const sanitized = {
                    ...char,
                    avatar_url: char.avatar_url
                        ? getSafeAvatarUrl(char.name, char.avatar_url)
                        : char.avatar_url,
                    feature_image_url: char.feature_image_url
                        ? getSafeAvatarUrl(char.name, char.feature_image_url)
                        : char.feature_image_url,
                    relationships: ensureJsonObject(char.relationships)
                };
                
                // Then filter to keep only known fields
                return filterKnownFields(sanitized);
            });

            // Log sanitized characters for debugging
            console.info('[bulkCreateCharacters] Sanitized characters:', 
                sanitizedCharacters.map(c => ({ 
                    name: c.name, 
                    fields: Object.keys(c).join(',')
                }))
            );

            // 1) Check which characters already exist (by unique name)
            const names = sanitizedCharacters.map(c => c.name);
            const { data: existing, error: lookupErr } = await supabase
                .from('characters')
                .select('id,name')
                .in('name', names);
            if (lookupErr) throw lookupErr;

            const existingMap = new Map((existing ?? []).map(row => [row.name, row.id]));

            const toInsert = [];
            const toUpdate = [];
            for (const char of sanitizedCharacters) {
                const existingId = existingMap.get(char.name);
                if (existingId) {
                    toUpdate.push({ id: existingId, ...char });
                }
                else {
                    toInsert.push(char);
                }
            }

            console.info('[bulkCreateCharacters] toInsert:', toInsert.length, '| toUpdate:', toUpdate.length);

            const results = [];

            /* INSERT NEW ---------------------------------------------------- */
            if (toInsert.length) {
                for (const char of toInsert) {
                    try {
                        const { data: inserted, error: insertErr } = await supabase
                            .from('characters')
                            .insert(char)
                            .select('*')
                            .single();
                        if (insertErr) {
                            console.error(`[bulkCreateCharacters] insert error for ${char.name}`, insertErr);
                            throw insertErr;
                        }
                        results.push(inserted);
                    }
                    catch (indivErr) {
                        // Re-throw after logging so caller knows the whole bulk op failed
                        throw indivErr;
                    }
                }
            }

            /* UPDATE EXISTING ------------------------------------------------ */
            for (const char of toUpdate) {
                // remove id from update payload to avoid immutable-column error
                const { id, ...updates } = char;
                const { data: updated, error: updErr } = await supabase
                    .from('characters')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select('*')
                    .single();
                if (updErr) {
                    console.error(`[bulkCreateCharacters] update error for ${char.name}`, updErr);
                    throw updErr;
                }
                results.push(updated);
            }

            return this.sanitizeCharacters(results);
        }
        catch (error) {
            console.error('Failed to bulk create characters:', error);
            throw new Error('Failed to bulk create characters. Please try again later.');
        }
    }
};
