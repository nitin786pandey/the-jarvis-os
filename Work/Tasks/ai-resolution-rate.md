# Increase AI resolution rate

**Connected goal:** Reduce AI → Human handover %

## First principles breakdown
What causes handover?
1. AI doesn't have the information it needs (context problem)
2. AI isn't smart enough for the query (model problem)
3. AI can't take the required action (tool problem)
4. AI isn't confident enough (calibration problem)
5. Customer doesn't trust the AI (UX/trust problem)

## Current hypothesis (Feb 2026)
Main handover causes at Manifest:
1. **Tool gap (#3)** — AI can't perform actions like cancellation
2. **Trust gap (#5)** — Customer wants human regardless

### Deeper question on trust gap:
- Are customers asking for human because they *never* trusted AI for this query?
- Or did they *lose* trust mid-conversation (AI fumbled)?
- This distinction changes the solution entirely!

## Questions to investigate
- What % of handovers are each category?
- Which category has the highest leverage?
- What's the current baseline resolution rate?
- For "wants human" requests: at what point in conversation do they ask?

## Next actions
- [ ] Analyze last 100 handovers — categorize by root cause
- [ ] Identify top 3 query types that fail most often
- [ ] Propose one experiment to improve resolution
