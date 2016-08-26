import React from 'react';

export default class About extends React.Component {
    componentWillMount() {
        const script = document.createElement("script");

        script.src = '/agentcar.js';
        script.async = true;
        Object.assign(script, { type: 'text/javascript', charset: 'UTF-8' });
        script.setAttribute('data-userid', 'kZD2WwvnheG9RCwwD');

        document.body.appendChild(script);
    }
    render() {
        return (
            <div>
                Our super project!
            </div>
        )
    }
}

// const About = () => {
//
//     return (
//         <div>
//             Our super project!
//
//             <script data-userid="kZD2WwvnheG9RCwwD" type="text/javascript" charset="UTF-8" src="http://debian359.tk/agentcar.js"></script>
//             <div className="agent_car_widget"></div>
//
//         </div>
//     )
// };
//
// export default About
