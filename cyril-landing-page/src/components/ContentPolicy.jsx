import React from 'react';
import { Link } from 'react-router-dom';

const ContentPolicy = () => {
  return (
    <div className="container" style={{ padding: '6rem 2rem', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" className="text-purple" style={{ display: 'inline-flex', alignItems: 'center', fontWeight: '500' }}>
            <span style={{ marginRight: '0.5rem' }}>&larr;</span> Back to Home
          </Link>
        </div>
        
        <h1 className="mb-4" style={{ fontSize: '2.5rem' }}>Content Sourcing and Copyright Compliance Policy</h1>
        
        <section className="mb-8">
          <h2 className="mb-4" style={{ fontSize: '1.8rem', borderBottom: '2px solid rgba(197, 160, 89, 0.2)', paddingBottom: '0.5rem' }}>1. Purpose and Scope</h2>
          <p className="mb-4 text-text-secondary">
            This policy outlines the standards for creating, hosting, and distributing educational materials within our learning platforms and community spaces. As an educational non-profit organization, we are committed to respecting intellectual property rights while providing rigorous, accessible learning experiences.
          </p>
          <p className="mb-4 text-text-secondary">
            This policy applies to all courses, community discussions, knowledgebase articles, and interactive activities across our entire educational library, including but not limited to theological texts, technical documentation, and published literature.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4" style={{ fontSize: '1.8rem', borderBottom: '2px solid rgba(197, 160, 89, 0.2)', paddingBottom: '0.5rem' }}>2. Core Operational Principles</h2>
          
          <h3 className="mb-2" style={{ fontSize: '1.4rem' }}>2.1. Original Synthesis and Expression</h3>
          <p className="mb-4 text-text-secondary">
            Copyright protects the specific expression of an idea, not the underlying facts, concepts, or historical traditions. To ensure compliance and prioritize pedagogical value, our platform relies on original synthesis.
          </p>
          <ul className="mb-4 text-text-secondary" style={{ paddingLeft: '1.5rem' }}>
            <li className="mb-2"><strong>Originality Requirement:</strong> All summaries, reflections, study guides, and pedagogical activities must be written in the author's original words.</li>
            <li className="mb-2"><strong>Concept Exploration:</strong> Curriculum designers are encouraged to explore structural phases, historical contexts, and underlying concepts (e.g., the stages of a process, thematic elements of a text) without copying the proprietary text or formatting of the source material.</li>
          </ul>

          <h3 className="mb-2 mt-12" style={{ fontSize: '1.4rem', marginTop: '2rem' }}>2.2. Educational Fair Use for Excerpts</h3>
          <p className="mb-4 text-text-secondary">
            Under the "Fair Use" provision of U.S. copyright law, short excerpts of copyrighted material may be used for specific educational purposes, such as criticism, comment, teaching, and scholarship.
          </p>
          <ul className="mb-4 text-text-secondary" style={{ paddingLeft: '1.5rem' }}>
            <li className="mb-2"><strong>Purpose of Excerpts:</strong> Quoted material must actively serve the learning experience (e.g., serving as a discussion prompt, an object of critique, or a focal point for analysis).</li>
            <li className="mb-2"><strong>Length Limitations:</strong> Excerpts should be strictly limited to the minimum amount necessary to achieve the pedagogical goal. As a general organizational standard, excerpts should not exceed 500 words from a single copyrighted source within a specific module or lesson.</li>
            <li className="mb-2"><strong>Attribution:</strong> All quoted material must be clearly demarcated and formally attributed to the copyright holder and original publisher.</li>
          </ul>

          <h3 className="mb-2 mt-12" style={{ fontSize: '1.4rem', marginTop: '2rem' }}>2.3. The "Bring Your Own Book" (BYOB) Model</h3>
          <p className="mb-4 text-text-secondary">
            To protect the organization from liability and to support content creators and publishers, we do not host full verbatim texts, lengthy prayers, extensive rubrics, or complete chapters of copyrighted works on our servers.
          </p>
          <ul className="mb-4 text-text-secondary" style={{ paddingLeft: '1.5rem' }}>
            <li className="mb-2"><strong>Primary Sources as Textbooks:</strong> Proprietary texts are treated as required course materials.</li>
            <li className="mb-2"><strong>External Referencing:</strong> Course modules will direct learners to read specific, universally identifiable sections (e.g., paragraph numbers, chapter headings, or standard document references) from their independently purchased or legally acquired copies.</li>
            <li className="mb-2"><strong>Platform Function:</strong> The learning platform is strictly reserved for the resulting interactive activities, community discussions, and knowledge-check assessments that follow the independent reading.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4" style={{ fontSize: '1.8rem', borderBottom: '2px solid rgba(197, 160, 89, 0.2)', paddingBottom: '0.5rem' }}>3. Compliance and Review</h2>
          <p className="mb-4 text-text-secondary">
            All new courses and knowledgebase additions must be reviewed against these three principles prior to publication in the live environment. Any material found to be relying too heavily on verbatim replication rather than original pedagogical design will be returned for revision.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ContentPolicy;
