import { Script } from "@rosebud/timeline/src/types/script";

let SCRIPT: Script.ScriptSequence = [
    {
        time: 500,
        commands: [
            {hideEvents: []},
            {hidePeriods: []},
            {showEvents: [1]}
        ]
    },
    {
        time: 1500,
        commands: [
            {showEvents: [3, 5]},
        ]
    },
    {
        time: 3000,
        commands: [
            {showEvents: [8, 9]},
            {showPeriods: [1]}
        ]
    },
    {
        time: 4500,
        commands: [
            {hideEvents: [1]}
        ]
    },
    {
        time: 6000,
        commands: [
            {hideEvents: [3, 5]}
        ]
    },
    {
        time: 7500,
        commands: [
            {hideEvents: [8, 9]},
            {hidePeriods: [1]}
        ]
    },
    {
        time: 9000,
        commands: [
            {showPeriods: []},
            {showEvents: []}
        ],
    },
    {
        time: 10500,
        commands: [
            {hideEvents: []},
            {hidePeriods: []}
        ]
    },
    {
        time: 11500,
        commands: [
            {showEvents: [1]}
        ]
    },
    {
        time: 13000,
        commands: [
            {hideEvents: [1]},
            {showPeriods: [1]},
            {showEvents: [2]}
        ]
    },
    {
        time: 14000,
        commands: [
            {hideEvents: [2]},
            {hidePeriods: [1]},
            {showPeriods: [2]},
            {showEvents: [7]}
        ],
    },
    {
        time: 15000,
        commands: [
            {hideEvents: [7]},
            {hidePeriods: [2]},
            {showPeriods: [3]},
            {showEvents: [10]}
        ]
    },
    {
        time: 16000,
        commands: [
            {hidePeriods: [3]},
            {hideEvents: [10]},
            {showEvents: [15]},
            {showPeriods: [4]}
        ]
    },
    {
        time: 17000,
        commands: [
            {hidePeriods: [4]},
            {hideEvents: [15]},
            {showEvents: [19]},
            {showPeriods: [5]}
        ]
    },
    {
        time: 18000,
        commands: [
            {hidePeriods: [5]},
            {hideEvents: [19]},
            {showEvents: [20]},
            {showPeriods: [6]}
        ]
    },
    {
        time: 19000,
        commands: [
            {hidePeriods: [6]},
            {hideEvents: [20]},
            {showEvents: [21]},
            {showPeriods: [7]}
        ]
    },
    {
        time: 20000,
        commands: [
            {showEvents: []},
            {showPeriods: []}
        ]
    }
];

export default SCRIPT;
