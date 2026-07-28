import path from 'path';
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

const STORAGE_STATE_PATH =
	process.env.STORAGE_STATE_PATH ||
	path.join( process.cwd(), 'artifacts/storage-states/admin.json' );

/**
 * Playwright global setup: authenticates the admin user once per test run
 * and saves cookies + REST nonce to artifacts/storage-states/admin.json.
 *
 * The playwright.config.ts loads that file as `storageState` so every
 * browser context starts already logged in.
 */
async function globalSetup(): Promise< void > {
	const requestUtils = await RequestUtils.setup( {
		baseURL: process.env.WP_BASE_URL ?? 'http://localhost:8888',
		storageStatePath: STORAGE_STATE_PATH,
		user: {
			username: process.env.WP_USERNAME ?? 'admin',
			password: process.env.WP_PASSWORD ?? 'password',
		},
	} );

	await requestUtils.setupRest();
	await requestUtils.request.dispose();
}

export default globalSetup;
