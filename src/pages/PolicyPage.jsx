import React from "react";

const PolicyPage = ({ title, content }) => (
  <div className="max-w-4xl mx-auto p-8 bg-white my-10 rounded-2xl shadow-sm border border-slate-200">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
    <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap text-sm md:text-base">
      {content}
    </div>
  </div>
);

export default PolicyPage;
