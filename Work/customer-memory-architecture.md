# Customer memory architecture for Manifest AI

## Design principle
Split data between **Memory** (always present) and **RAG** (retrieved on-demand) based on:
- Token cost vs. value tradeoff
- Frequency of need
- Impact on response quality

---

## Memory (always in context)

### Customer identification
- Name
- Mobile number  
- Email ID

### Chat preferences
- Tone style / User sentiment from last conversation
- Customer requirement / concern
- More details about requirement

**Why in memory:** Small token cost, affects every response. Enables personalization and appropriate tone from first message.

---

## RAG (retrieved on-demand)

### Past behavior history
- addToCart events
- checkoutCompleted events
- productClicked (array)
- productViewed (array)
- Last Order ID
- Last Order Tracking Details
- Last conversation VOC (voice of customer)
- Number of sessions
- Last visited date

### Contextual data
- Location (for shipping/store queries)
- Device/Browser (for troubleshooting)

**Why in RAG:** Large data, only relevant for specific query types (order status, recommendations based on history).

---

## Open questions
- How often should sentiment/tone be updated?
- What's the memory decay policy? (Does 6-month-old sentiment still matter?)
- How do we handle conflicting signals? (Recent frustrated, but historically happy)
