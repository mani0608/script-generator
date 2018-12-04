import {
    animate,
    animateChild,
    animation,
    AnimationOptions,
    stagger,
    useAnimation,
    group,
    keyframes,
    query,
    state,
    style,
    transition,
    trigger,
    sequence
} from '@angular/animations';

export const shrink = trigger('shrink', [
    transition('out => in', [
        query('#upload-content', style({ height: '0' })),
        query('#upload-content', [
            animate('.3s ease-in', style({
                height: '*'
            }))
        ])
    ]),
    transition('in => out', [
        query('#upload-content', [
            animate('.3s ease-in',
                style({
                    height: '0'
                }))
        ])
    ])
])

export const shrinkHF = trigger('shrinkHF', [
    transition('out => in', [
        query('#history-section', style({ height: '0' })),
        query('#history-section', [
            animate('.3s ease-in', style({
                height: '*'
            }))
        ])
    ]),
    transition('in => out', [
        query('#history-section', [
            animate('.3s ease-in',
                style({
                    height: '0'
                }))
        ])
    ])
])

export const routerAnimation = trigger('routerAnimation', [
    transition('* => *', [
        sequence([
            query(':leave', animateChild()),
            query(':enter', animateChild())
        ])
    ])
]);

export const uploadAnimation = trigger('uploadAnimation', [
    transition(':enter', [
        query('#upload-content', style({ transform: 'translateY(-200px)', opacity: 0 })),
        // query('.header-img', style({
        //     transform: 'scale(5) perspective(300px) translateZ(-400px) translateY(50px)',
        //     opacity: 0
        // })),
        query('.chk-qb-review', style({ transform: 'scale(.3)', opacity: 0 })),
        query('.input-isn', style({ transform: 'scale(.3)', opacity: 0 })),
        query('button', style({ transform: 'scale(.3)', opacity: 0 })),
        query('.upload-ctrl', style({ transform: 'translateX(-200px)', opacity: 0 })),
        query('.upload-title', style({ transform: 'scale(.3)', opacity: 0, color: '#000000' })),

        query('#upload-content', [
            animate('0.3s ease-in-out', style({
                transform: 'translateY(0)',
                opacity: 1
            })),
            query('*', animateChild())
        ]),

        group([
            // query('.header-img', [
            //     animate('.5s .3s ease', style('*'))
            // ]),
            query('.chk-qb-review', stagger(100, [
                animate('0.5s', style({ opacity: 1, transform: 'scale(1)' }))
            ])),
            query('.input-isn', stagger(100, [
                animate('0.5s', style({ opacity: 1, transform: 'scale(1)' }))
            ])),
            query('button', stagger(100, [
                animate('0.5s', style({ opacity: 1, transform: 'scale(1)' }))
            ])),
            query('.upload-ctrl', [
                animate('0.3s ease-in-out', style({
                    transform: 'translateX(0)',
                    opacity: 1
                })),
            ]),

            query('.upload-title', [
                animate('0.3s', style({ opacity: 1, transform: 'scale(1)' }))
            ])

        ])

    ]),

    transition(':leave', [

        query('#upload-content', [
            animate('0.3s', style({ transform: 'scale(.3)' }))
        ]),
    ])
])

export const hfAnimation = trigger('hfAnimation', [
    transition(':enter', [
        query('#history-section', style({ transform: 'translateY(-100px)', opacity: 0 })),
        query('button', style({ transform: 'scale(.3)', opacity: 0 })),

        query('.history-section', [
            animate('0.5s ease-in-out', style({
                transform: 'translateY(0)',
                opacity: 1
            }))
        ]),

        query('button', stagger(100, [
            animate('0.5s', style({ opacity: 1, transform: 'scale(1)' }))
        ]))

    ]),

    transition(':leave', [

        query('#history-section', [
            animate('0.3s', style({ transform: 'scale(.3)' }))
        ]),

    ])
])


export const qbAnimation = trigger('qbAnimation', [
    transition('none => show', [
        query('.modal-dialog', style({ transform: 'scale(.3)', opacity: 0 })),
        query('.content-left', style({ transform: 'translateX(-200px)', opacity: 0 })),
        query('.content-right', style({ transform: 'translateX(200px)', opacity: 0 }), { optional: true }),
        query('button', style({ transform: 'scale(.7)', opacity: 0 })),
        query('input', style({ transform: 'translateY(-200px)' })),

        group([
            query('.modal-dialog', [
                group([
                    animate('0.3s 0.1s ease-in-out', style({
                        transform: 'scale(1)',
                    })),
                    animate('0.3s ease', style({
                        opacity: 1
                    })),
                    query('*', animateChild())
                ])
            ]),

            query('.content-left', [
                animate('0.5s ease-in-out', style({
                    transform: 'translateX(0)',
                    opacity: 1
                }))
            ]),

            query('.content-right', [
                animate('0.5s ease-in-out', style({
                    transform: 'translateX(0)',
                    opacity: 1
                }))
            ], { optional: true }),

            query('button', stagger(100, [
                animate('0.5s', style({ opacity: 1, transform: 'scale(1)' }))
            ])),

            query('input',
                animate('0.5s ease', keyframes([
                    style({ opacity: 0, transform: 'translateY(-200px)', offset: 0 }),
                    style({ opacity: 1, transform: 'translateY(200px)', offset: 0.3 }),
                    style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 })
                ]))
            )

        ]),

    ]),
    transition('show => none', [
        group([
            query('.content-left', [
                animate('0.3s 0.1s ease', style({
                    transform: 'translateX(-200px)',
                    opacity: 0
                }))
            ]),

            query('.content-right', [
                animate('0.3s 0.1s ease', style({
                    transform: 'translateX(200px)',
                    opacity: 0
                }))
            ], { optional: true }),

            query('button', stagger(20, [
                animate('0.3s', style({ opacity: 0, transform: 'scale(.7)' }))
            ])),

            query('input',
                animate('0.3s ease-in-out', keyframes([
                    style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
                    style({ opacity: 1, transform: 'translateY(200px)', offset: 0.7 }),
                    style({ opacity: 0, transform: 'translateY(-200px)', offset: 1.0 })
                ]))
            ),

            query('.modal-dialog', [
                group([
                    animate('0.5s ease-out', style({
                        transform: 'scale(.3)',
                    })),
                    animate('0.3s ease', style({
                        opacity: 0
                    })),
                    query('*', animateChild())
                ])
            ]),
        ]),
    ])
])

export const rcAnimation = trigger('rcAnimation', [
    transition(':enter', [

        query('.review-conditions-container', style({ opacity: 0 })),
        query('input', style({ transform: 'translateY(0)' })),

        query('.review-conditions-container',
            group([
                animate('0.3s ease', style({
                    opacity: 1
                })),
                query('*', animateChild())
            ])
        ),

        query('input',
            animate('0.5s ease', keyframes([
                style({ opacity: 0, transform: 'translateY(-200px)', offset: 0 }),
                style({ opacity: 1, transform: 'translateY(100px)', offset: 0.3 }),
                style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 })
            ]))
        )

    ]),

    transition(':leave', [
        query('.review-conditions-container', [
            group([
                animate('0.3s ease', style({
                    opacity: 0
                })),
                query('*', animateChild())
            ])
        ]),

        query('input',
            animate('0.5s ease', keyframes([
                style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
                style({ opacity: 1, transform: 'translateY(100px)', offset: 0.7 }),
                style({ opacity: 0, transform: 'translateY(-200px)', offset: 1.0 })
            ]))
        )
    ])
])

export const treeNodeAnimation = trigger('treeNodeAnimation', [
    transition('collapsed => expanded', [
        query('.ui-widget-content', style({ height: '0' })),
        query('.ui-treenode-leaf', style({ transform: 'translateX(-300px)' })),

        query('.ui-widget-content', [
            animate('.3s ease-in', style({
                height: '*'
            }))
        ]),
        query('.ui-treenode-leaf', stagger(100, [
            animate('0.5s ease-in', style({ transform: 'translateX(0)' }))
        ]))
    ]),

    transition('expanded => collapsed', [
        query('.ui-treenode-leaf', stagger(100, [
            animate('0.5s ease-out', style({ transform: 'translateX(-300px)' }))
        ])),

        query('.ui-widget-content', [
            animate('.3s .5s ease-in', style({
                height: '0'
            }))
        ]),
    ]),
]);