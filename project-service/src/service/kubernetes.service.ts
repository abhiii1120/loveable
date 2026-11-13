import * as k8s from "@kubernetes/client-node";

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

export async function createPod(podName:string, projectId:string){
    const podManifest = {
        apiVersion:'v1',
        kind:'Pod',
        metadata:{
            name:podName,
            labels:{
                app:podName
            }
        },
        spec:{
            volumes:[
                {
                    name:'app-volume',
                    emptyDir:{}
                }
            ],
            initContainers:[
                {
                    name:'init-container',
                    image:'nextjs-boilerplate',
                    command: ['sh', '-c', 'mkdir -p /app-copy && cp -r /app/* /app-copy'],
                    volumeMounts:[
                        {
                            name:'app-volume',
                            mountPath:'/app-copy',
                        }
                    ]
                }
            ],
            containers:[
                {
                    name:'nextjs-container',
                    image:'nextjs-boilerplate',
                    ports:[
                        {
                            containerPort:3000
                        }
                    ],
                    resources:{
                        requests:{
                            memory:'1024Mi',
                            cpu:'500m'
                        },
                        limits:{
                            memory:'2048Mi',
                            cpu:'1000m'
                        }
                    },
                    volumeMounts:[
                        {
                            name:'app-volume',
                            mountPath:'/app',
                        }
                    ]
                },
                {
                    name:'file-server-container',
                    image:'express-file-server',
                    ports:[
                        {
                            containerPort:8080
                        }
                    ],
                    resources:{
                        requests:{
                            memory:'512Mi',
                            cpu:'250m'
                        },
                        limits:{
                            memory:'1024Mi',
                            cpu:'500m',
                        }
                    },
                    volumeMounts:[
                        {
                            name:'app-volume',
                            mountPath:'/app'
                        }
                    ]

                },
                {
                    name:'sync-container',
                    image:'sync-service',
                    env:[
                        {
                            name:'PROJECT_ID',
                            value:projectId
                        },
                        {
                            name:"AWS_ACCESS_KEY_ID",
                            valuefrom:{
                                secretKeyRef:{
                                    name:"aws",
                                    key:"AWS_ACCESS_KEY_ID"
                                }
                            }
                        },
                        {
                            name:"AWS_SECRET_ACCESS_KEY",
                            valuefrom:{
                                secretKeyRef:{
                                    name:"aws",
                                    key:"AWS_SECRET_ACCESS_KEY"
                                }
                            }
                        }
                    ],
                    resources:{
                        requests:{
                            memory:'256Mi',
                            cpu:'100m'
                        },
                        limits:{
                            memory:'512Mi',
                            cpu:'300m',
                        }
                    },
                    volumeMounts:[
                        {
                            name:'app-volume',
                            mountPath:"/app"
                        }
                    ]
                }
            ]
        }
    }

    const response = await k8sApi.createNamespacedPod({
    namespace:"default",
    body:podManifest
});

console.log("pod successfully created!")
console.log(response);
};

export async function createService(serviceName:string,podName:string){

    const serviceManifest = {
        apiVersion:'v1',
        kind:'Service',
        metadata:{
            name:serviceName,
            labels:{
                app:podName,
            }
        },
        spec:{
            selector:{
                app:podName
            },
            ports:[
                {
                    name:"preview-port",
                    protocol:'TCP',
                    port:80,
                    targetPort:3000
                },
                {
                    name:'file-server-port',
                    protocol:'TCP',
                    port:8000,
                    targetPort:8080
                }
            ],
            type:'LoadBalancer'
        }
    }

    const response = await k8sApi.createNamespacedService({
        namespace:"default",
        body:serviceManifest
    })

    console.log("Service successfully created");
    console.log(response)
}

/** True when the kubernetes API rejected the request because the object is gone. */
function isNotFound(error:unknown){
    return (error as {code?: number}).code === 404
}

/**
 * Deletes a preview pod, treating an already-deleted pod as success.
 * 
 * @param podName Name of the pod in the default namespace
 */
export async function deletePod(podName:string){
    try {
        await k8sApi.deleteNamespacedPod({namespace:"default",name:podName})
        console.log(`Pod ${podName} deleted`);
    } catch (error) {
        if(isNotFound(error)) return 
        throw error
    }
}

/**
 * Deletes a preview service, treating an already-deleted service as success.
 * 
 * @param serviceName Name of the service in the default workspace.
 */
export async function deleteService(serviceName:string){
    try {
        await k8sApi.deleteNamespacedService({namespace:"default",name:serviceName});
        console.log(`Service ${serviceName} deleted`);
    } catch (error) {
        if (isNotFound(error)) return;
        throw error
    }
}