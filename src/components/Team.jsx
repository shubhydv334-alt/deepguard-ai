import React from 'react'
import './Team.css'

const TEAM = [
    {
        name: 'Ved Rane',
        role: 'Full-Stack Lead',
        bio: 'Overall system architecture, backend APIs, frontend integration, deployment setup, and end-to-end demo stability.',
        initials: 'VR',
        color: '#06d6a0',
    },
    {
        name: 'Sushant Zanwar',
        role: 'Full-Stack Developer',
        bio: 'Feature development, UI integration, comparison views, live webcam flow, and performance tuning.',
        initials: 'SZ',
        color: '#4fc3f7',
    },
    {
        name: 'Shubham Yadav',
        role: 'AI Workflow, UI/UX & Testing',
        bio: 'Deepfake detection workflow design, AI result interpretation, UI/UX integration with AI outputs, test cases, validation, and demo reliability.',
        initials: 'SY',
        color: '#e040fb',
    },
]

export default function Team() {
    return (
        <section className="section team" id="team">
            <div className="container">
                <div className="section-header">
                    <div className="badge" style={{ marginBottom: 16 }}>
                        <span>👥</span> Our Team
                    </div>
                    <h2>
                        Meet the <span className="gradient-text">Team</span>
                    </h2>
                    <p>
                        The talented engineers behind DeepGuard AI — building intelligent tools
                        to protect the integrity of digital media.
                    </p>
                </div>

                <div className="team__grid">
                    {TEAM.map((member, i) => (
                        <div className="team__card glass-card" key={i}>
                            <div className="team__card-inner">
                                <div className="team__card-front">
                                    <div
                                        className="team__avatar"
                                        style={{ background: member.color + '15', color: member.color, borderColor: member.color + '30' }}
                                    >
                                        {member.initials}
                                    </div>
                                    <h4 className="team__name">{member.name}</h4>
                                    <span className="team__role" style={{ color: member.color }}>{member.role}</span>
                                    <p className="team__bio">{member.bio}</p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
