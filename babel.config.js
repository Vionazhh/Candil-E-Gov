module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './',
                    },
                },
            ],
            'react-native-reanimated/plugin',
            ['babel-plugin-dotenv-import', {
                moduleName: '@env',
                path: '.env',
                safe: false,
                allowUndefined: true,
            }],
        ],
    };
};