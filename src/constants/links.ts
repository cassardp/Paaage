import type { Config } from '../types/config';

/**
 * Retourne la configuration d'ouverture des liens depuis la config
 */
export function getLinkTarget(config: Config): '_blank' | '_self' {
    return config.settings.linkTarget;
}
