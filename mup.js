module.exports = {
  servers: {
    one: {
      host: 'debian359.tk',
      username: 'root',
      // pem:
      // password:
      // or leave blank for authenticate from ssh-agent
      opts: {
          port: 22,
      },
    }
  },

  meteor: {
    name: 'AgentCar',
    path: '/home/horo/dev/agentcar',
//    volumes: { //optional, lets you add docker volumes
//      "/host/path": "/container/path", //passed as '-v /host/path:/container/path' to the docker run command
//      "/second/host/path": "/second/container/path"
//    },
    docker: {
      image: 'abernix/meteord:base',
//      image:'kadirahq/meteord',//optional
//      args:[ //optional, lets you add / overwrite any parameter on the docker run command
//        "--link=myCustomMongoDB:myCustomMongoDB", //linking example
//        "--memory-reservation 200M"//memory reservation example
//      ]
    },
    servers: {
      one: {}//, two: {}, three: {} // list of servers to deploy, from the 'servers' list
    },
    buildOptions: {
      serverOnly: true,
      debug: true,
      cleanAfterBuild: true, // default
//      buildLocation: '/my/build/folder' // defaults to /tmp/<uuid>
      mobileSettings: {
        yourMobileSetting: "setting value"
      }
    },
    env: {
      ROOT_URL: 'debian359.tk',
      MONGO_URL: 'mongodb://localhost/meteor'
    },
    log: { //optional
      driver: 'syslog',
//      opts: {
//        "syslog-address":'udp://syslogserverurl.com:1234'
//      }
    },
//    ssl: {
//      port: 443,
//      crt: 'bundle.crt',
//      key: 'private.key',
//    },
    deployCheckWaitTime: 60 //default 10
  },

  mongo: { // optional
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
