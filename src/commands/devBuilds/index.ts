import QRcodeTerminal from 'qrcode-terminal';
import {
    logAndroid,
    logError,
    logIOS,
    logIOSAlt,
} from '../../utils/logger/index.js';

interface Options {
    runtimeVersion?: string;
}

export async function action(options: Options): Promise<void> {
    const runtimeVersion =
        options.runtimeVersion || (await getRuntimeVersion());

    const android = await getBuildInfo({
        runtimeVersion,
        platform: 'android',
    });
    const iosPhysical = await getBuildInfo({
        runtimeVersion,
        platform: 'ios',
    });
    const iosSimulator = await getBuildInfo({
        runtimeVersion,
        buildProfile: 'development-simulator',
        platform: 'ios',
    });

    if (android?.buildUrl) {
        logAndroid('Android artifact : ' + android.buildUrl);
        logAndroid('Android build : ' + android.url);
        QRcodeTerminal.generate(android.buildUrl, { small: true });
    }
    if (iosPhysical?.iOSDeeplink) {
        logIOSAlt('iOS physical artifact : ' + iosPhysical.buildUrl);
        logIOSAlt('iOS physical build : ' + iosPhysical.url);
        QRcodeTerminal.generate(iosPhysical.iOSDeeplink, {
            small: true,
        });
    }
    if (iosSimulator?.url) {
        logIOS('iOS simulator artifact : ' + iosSimulator.buildUrl);
        logIOS('iOS simulator build : ' + iosSimulator.url);
    }
}

async function getBuildInfo({
    runtimeVersion,
    buildProfile,
    platform,
    channel,
    status,
}: {
    runtimeVersion: string;
    platform: string;
    buildProfile?: string;
    channel?: string;
    status?: string;
}): Promise<{
    buildUrl: string;
    url: string;
    iOSDeeplink?: string;
} | null> {
    // Note: we have to use spawnSync because spawn doesn't fully wait until EAS' response
    const proc = Bun.spawnSync([
        'eas',
        'build:list',
        `--runtimeVersion=${runtimeVersion}`,
        `--channel=${channel || 'development'}`,
        `--status=${status || 'finished'}`,
        `--buildProfile=${buildProfile || 'development'}`,
        `--platform=${platform}`,
        '--limit=1',
        '--json',
        '--non-interactive',
    ]);

    const buffer: Buffer = proc.stdout as Buffer;
    try {
        const parsedJSON = JSON.parse(buffer.toString());
        return {
            buildUrl: parsedJSON[0]?.artifacts?.buildUrl,
            url: `https://expo.dev/accounts/${parsedJSON[0].project.ownerAccount.name}/projects/${parsedJSON[0].project.slug}/builds/${parsedJSON[0].id}`,
            iOSDeeplink:
                platform === 'ios' && buildProfile !== 'development-simulator'
                    ? `itms-services://?action=download-manifest;url=https://api.expo.dev/v2/projects/${parsedJSON[0].project.id}/builds/${parsedJSON[0].id}/manifest.plist`
                    : undefined,
        };
    } catch {
        logError(buffer.toString());
        return null;
    }
}

async function getRuntimeVersion(): Promise<string> {
    try {
        const appJsonFile = Bun.file('app.json');
        const jsonContent = await appJsonFile.json();
        if (!jsonContent?.expo?.runtimeVersion) {
            throw new Error('Missing runtimeVersion property in app.json file');
        }

        return jsonContent.expo.runtimeVersion;
    } catch {
        throw new Error(
            'runTimeVersion option not supplied and app.json file not found',
        );
    }
}
