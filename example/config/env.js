const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  const processEnv = Object
    .keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    }, {
      'NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      'PUBLIC_URL': JSON.stringify(publicUrl)
    });
  return {'process.env': processEnv};
}

module.exports = getClientEnvironment;
