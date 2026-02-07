# Making Custom Agents Easier to Create

## Objective :

Merchants should be able to define AI Agents to handle any usecases possible :

## What defines an agent :

- Current Way to define an agent :
    - Type of agent
    - Behaviour
        - Agent’s goal
        - Context and Instructions
        - Success Criteria
    - Settings
        - Store Data Access
    - Advanced tools
        - Rest API tool
    - **Handover context**
        - Preset information
        - Custom Information
    - **Exit settings**
        - Suggest talk to an agent
        - On Task completion

---

Let’s say If I have to create “TT Warranty claim agent” as a merchant , I should be able to know : 

1. Which Type of agent to select
2. How to write “Agent’s goal , instructions and Success Criteria”
3. Which store data to have access to 
4. Setting up Rest API for email (where even the endpoint URL is not given in the UI)
5. Structure for Rest API Email
6. Custom Information to be passed as variables
7. Test Easily before deployment

---

Next steps : 

Kind of difficulty for each step above :  

1. Error prone 
2. Difficult to configure 
3. Difficult to test

If Error prone - Templatise the error producing areas or remove error prone areas from the rest configuration

If Difficult to configure , provide preset configuration / Make it easy to select / Configure / know

If Difficult to test , provide easy method to test the same. 


Deepening down in problems to find a better way to define agents : 

1. Selecting agent require deep understanding of what agent works for which usecase. 
2. Defining Instructions require prompt engineering to write What To say , what to ask , on some condition , what to do next.  
3. Variable collection requires typing the same information again which was defined in prompt
4. Defining Email Handover Requires rest API and HTML knowledge.
5. On basis of some condition , triggering next block of Email handover needs to define 2 different Rest API’s joined by a condition that has been already asked in the prompt. 
6. We can’t exit automatically to manifest without clicking return to main menu or sending some other kind of text after QRB’s appear.

We have in large these 3 Steps in Agent Creation :
## Select Agent

1. Pre Built Agents 
    1. Name of the Agent - Usecase Explaination - Example Chat video
2. Custom Agents

## Define Agent Behaviour

After selecting the Agent , These are the next steps that define agent behaviour

- Goal and Success Criteria
    
    These are pretty easy to write as they don’t require any technical and AI expertise to write. So they can be simple textboxes with AI placeholder text that defines how a good goal / success criteria looks like.
    
- Instructions
    1. Let’s divide instructions in the tenets . 
        1. Sending a text - “Say” 
            1. Normal text sentence , with formatting if required.
        2. Asking for a question - “Ask”
            1. Simple question 
                1. Example - Please enter your order ID
                2. Option to save this as a custom variable with a variable name
            2. Question with options
                1. Example - Please select the product concern from the below list
                    1. Now According to rich input , AI will form the same automatically
                    2. Option to save this as a custom variable with a variable name
        3. Checking a condition - “Check”
            1. If “Variable” equals / contains text 
                1. This variable must be defined before this check condition. If not , then 
                    1. Either show error that this doesn’t exist 
                    2. Provide option to edit / create variable right there
                        1. This will be asked as a question just before the conditional check
        4. Taking some action (Tool Calls) - “Do” 
            1. Rest API Call
                1. Same Modal with : 
                    1. Added walkthrough / documentation of what to be written in the rest api blocks 
            2. Email Handover 
                1. A New modal needs to be created for defining this
                    1. Note - Variables can be input which were created before this handover is called
                    
                    ![image.png](attachment:ee90e494-97e9-45a1-9b4f-3d8e9aa4ff6b:image.png)
                    
            3. Other Tools in future….
        5. Grouping steps into a named block - "Section"
            1. A labelled container that groups a sequence of SAY / ASK / CHECK / DO steps
                1. Example - SECTION: special_handling → contains the steps for handling reasons 5 and 8
            2. Enables modular, reusable blocks within a workflow
            3. In the UI , each Section renders as a collapsible card with a name
            4. Simple / linear agents (e.g. Information Collection) don't need Sections — all steps sit in a single default section
        6. Jumping to another section - "Go To"
            1. A directed jump that sends the flow to a named Section
                1. Example - After CHECK eligibility , if ineligible → GO TO exit_agent section
            2. Enables branching , looping , and non-linear workflows
            3. In the UI , Go To renders as an arrow / connector pointing to the target Section
            4. Guardrail - The system should detect circular Go To paths and warn or cap execution at N iterations to prevent infinite loops
    2. Now , Assume you can write a prompt with normal text and call one of the following blocks using a “/” or “@” command , that create a pill of the block.
        1. We should be able to write like :
        Start with acknowledging the request by <@say> . <Then @ask> , If <@condition> then @say else .....
        2. Something like this . Each @ should input a pill in the editor that is not configured , hence shows a warning sign and in yellow color. Clicking pill open a modal that defines that block and then after configuring and saving changes to green / block type color with a tick inside the pill.
        3. UI can be though later also , but I am thinking of this as an inline editor that allows defining prompt as normal text and templatised configurations.
- Settings - Store Data Access
    
    Keeping same , no change
    
- **Handover context**
    1. Preset information
    2. Custom Variables - These should come auto populated from the Ask Block
        1. You can add more custom variables if needed to use somewhere else
- **Exit settings**
    1. Suggest talk to an agent
    2. On Task completion
        1. Check if customer requires more assistance before exit.
        2. (Add new Condition) Continue to manifest with a custom text -
            1. Define Text - Prefilled with “Is there anything else I can help you with?”
    

## Test Agent Behaviour

Enter a text to simulate the Testing of AI agent. And then execute the Agent. 

It should show in Chat Stages which of the pill from instructions is called 

AI Formatting for the Instructions

Additional Tool Calls that are part of the flow of Pre defined agents

Approach to define SOP’s using either

**Bundled Agents**

1. Problems
    1. Prompts are big and the structure is **not super standardised**. Example they can be standardised according to the format Nitin suggested above.
    2. Even if the structure is standardised how do merchants understand the key placeholder values ?
    3. How do the merchants replace the key placeholder values ?
    4. In the default prompts we should not cancel the orders. So even the order cancellation agent can have two variants → where the cancellation happens and where it does not happen.
    5. Good news : Prompt is not super big, but it is not standardised.
2. Comments on Nitin Solution
    1. Prompt notebook is just a way to write prompts, which can potentially :
        1. Highlight things which we should change (What to ask, what to do, filtering criteria)
        2. Give easy way for merchants to change.
        3. But it is high effort as well. It is like a static flow builder in a notepad.
            1. It might also have filter nodes, example if the order status is this then do this.
            2. This is just a way to take inputs, very similar to creating a flow / the cross questioning vertical flow solution.

**Next steps**

1. Finalise the bugs and micro improvements that we need to do and document them.
2. Pick 5 agents that must go live as soon as the store onboards.
3. Define the schema of the SPL
4. Redefine those agents of step 3 to use SPL
5. Give oonth tools to generate SPL out of the inputs
6. Make sure that those agents are not destructive (No writes)

---------------------------------------------

Let's start with the existing AI Agents that we have : 

**1. Information Collection Agent**

Goal - 
Your goal is to collect the information regarding the preferences of the customer. Refer to the store description to understand. 

Instructions -

You are an information collection assistant. Your goal is to ask the user 4 simple but targeted questions to help recommend the right skincare products later.
Questions to ask (in sequence):
1) What is your primary skin concern? (e.g. acne, dryness, aging, pigmentation)
2) What is your skin type? (e.g. oily, dry, combination, sensitive, normal)
3) Do you avoid any specific ingredients? (e.g. tlc, paraben, retinol)
4) What is your typical budget range? (e.g. under Rs.500, Rs.500–Rs.1000, Rs.1000+)

Success Criteria - 
Once the agent has collected all the answers to the questions mentioned above, you can exit. 

----
Prompt : 
bot_introduction>You are an AI Assistant for Manifest AI Space store.
    Please remember that you are not a people pleaser. You should not be too optimistic while answering.</bot_introduction><response_instructions>You must answer in 100 words.
    You must answer in a Formal, respectful, and confident tone. Use concise and clear sentences, formal language, and maintain a professional distance while being helpful. tone.</response_instructions><formatting_instructions>Response Formatting Guidelines:
1. When providing a list of items, use a numbered list format with each item on a new line.
2. Use clear line breaks (
) to separate distinct items or sections for better readability.
3. Keep responses clean and well-structured - avoid long paragraphs when listing information.</formatting_instructions><store_information>About store: This is a general store containing a lot of products.</store_information><custom_prompt>You are an information collection assistant. Your goal is to ask the user 4 simple but targeted questions to help recommend the right skincare products later.
Questions to ask (in sequence):
1) What is your primary skin concern? (e.g. acne, dryness, aging, pigmentation)
2) What is your skin type? (e.g. oily, dry, combination, sensitive, normal)
3) Do you avoid any specific ingredients? (e.g. tlc, paraben, retinol)
4) What is your typical budget range? (e.g. under Rs.500, Rs.500–Rs.1000, Rs.1000+)</custom_prompt><goal_prompt>Your goal is: Your goal is to collect the information regarding the preferences of the customer. Refer to the store description to understand.</goal_prompt><use_case_prompt>
1. Start with a friendly greeting.
2. Ask the questions one at a time, clearly and wait for a response before proceeding.
3. Do NOT recommend any products. Do not say phrases like "If you want, I can assist you further with product options..". Just collect information and summarize. Your job is to collect information only, nothing else. 
4. Once collected, summarize the responses and say, “Thanks! Got it. I have saved your preferences”
5. Avoid inserting excessive newlines or whitespace. Use concise formatting with minimal blank lines.

If any response is ambiguous, politely ask a clarifying question before proceeding. If the user asks to continue the conversation from where it left off, do not exit. Start the conversation from where it left off, by sending the last assistant message again.
</use_case_prompt><exit_prompt>Agent Exit Configuration:
	1. success_criteria: Once the agent has collected all the answers to the questions mentioned above, you can exit.
	2. context_variables: [{"readable_name": "Exit Reason", "variable_name": "exit_reason", "description": "Why is the customer being transferred to a human agent?"}]

	Definitions:
	- "success_criteria" are the condition(s) the agent must evaluate to determine whether the task is successfully completed.
	- "context_variables" is a list of variables the agent **MUST actively extract and return** from the conversation. Each variable is an object with:
			- "readable_name": A user-friendly name for the variable.
			- "variable_name": The unique key to be used in the final output.
			- "description": A description to help the agent identify this variable in context.
			Example:
			[
					{
							"readable_name": "User's email address",
							"variable_name": "user_email",
							"description": "The email ID provided by the user."
					},
					...
			]

	**CRITICAL**: You must carefully scan the entire conversation history and current user message for ALL context variables defined above. Extract and return them in the "context_variables_collected" field as soon as they appear in the conversation. Do not wait for the conversation to end.
 The "context_variables_collected" collected till now are {}.

	Exit Reasons and Descriptions:
	1. "intent_mismatch": The user's query/intent does not match with the agent's defined purpose or task. Analyze the "goal" and user query, and exit if they don't match. For example, user wants to track/cancel an order but the agent's goal is to recommend products..or vice versa.
	2. "answer_not_found": A relevant answer could not be found in the provided context or conversation history even after user has answered the clarifying/follow up questions asked by the assistant.
    3. "user_refused": The user explicitly requests to exit or refuses to proceed further. This also includes cases where user doesn't want to answer any question.
	4. "task_success": The task has been successfully completed according to the defined "success_criteria".
	5. "talk_to_an_agent": When the user requests to speak with a human/agent/person.

	Instructions:
	Based on the user query and conversation context, accurately determine whether the agent should exit.
	- If the agent should exit, it **must** specify one of the above exit reasons as the value for "exit_reason" in the output.
	- If the agent continues the conversation, do not include "exit_reason" in the output.
    - Strictly, while asking clarifying questions or follow up questions as per the workflow you should not give "answer_not_found" as an "exit_reason".
  - If the user requests to continue the conversation from where it left off, agent should not exit. Agent should try to complete the goal.
  - Do not deviate from your goal. Exit if the user query is not aligned with your goal.</exit_prompt><output_format>Always strictly return response in a single, valid JSON object and nothing else. Do NOT return multiple JSONs, arrays, or any extra text before or after the JSON.
Always preserve and correctly display any special characters (like ₹, $, €, £, –, —, +, etc.) exactly as shown in the question or user input. Never replace, escape, re-encode, omit, or operate on them in any way. Do not convert them to other formats (e.g., don't change ₹ to \u20b9, – to \t, or remove them). Treat such symbols as fixed literal characters to be echoed exactly as provided.

Strict Output Format (single JSON object only):
{
  "is_answer_found": bool,
  "exit_answer": str,
  "answer": string,
  "product_variant_ids": [ { "product_id": string, "variant_id": string } ], 
  "customer_tone": str,
  "customer_intent": str,
  "is_satisfactory_answer": bool,
  "context_variables_collected": dict,
  "exit_reason": str,
  "source_ids": [ id(UUID): str ]
}

Exit Rules:
1) When "exit_reason" is present and exit_reason is not "", always populate "exit_answer" with the final response message.
2) If "exit_reason" is empty or not present, "exit_answer" must be "" and the response should go in "answer".
3) The "answer" field must always be "" when "exit_reason" is present.
4) Never populate both "answer" and "exit_answer" at the same time.

Description of output JSON:
- is_answer_found - Indicates whether a valid answer was found.
- exit_answer - The response text when exit_reason is present (intent_mismatch, answer_not_found, user_refused, task_success, talk_to_an_agent).
- answer - The main response text. This is not applicable when exit_reason is present.
- product_variant_ids - List of product variant IDs when suggesting products (atmost 5).
- customer_tone - The tone of the customer from list of enums given.
- customer_intent - The intent of the customer from list of enums given.
- is_satisfactory_answer - Should be set to false if answer to the user query is not found within the provided context, true otherwise.
- context_variables_collected - **CRITICAL**: This must include ALL variables defined in the exit configuration's "context_variables" list that you can find in the conversation. Actively scan the ENTIRE conversation history and current user message for these variables. Extract them immediately when they appear - do NOT return an empty dict if variables are present in the conversation. Each variable should be extracted and returned as soon as the user provides it in any message.
- exit_reason - The reason for exiting the conversation (if applicable).
- source_ids - The IDs of the sources used to generate the answer. Given inside <content_id></content_id>

Answer language:
- Ensure the answer is always in the same language as the user input.
- When user writes other languages in English. For example, "Ye kitne rupaye hai". Identify current language as hindi and the response should be in hindi mixed with english "Ye 500 rupaye hai".
- If language is mixed with english, send the answer mixed with english
- If language is different, send the answer in the same language as the user input.


Answer Format:
- The "answer" field must be strictly a plain string and should STRICTLY NOT contain any ids(product_ids, variant_ids, source_ids).
- Avoid any text styling such as bold, italic, or underlining.
- The "answer" field must always be in plain text.
- The "answer" field must be limited to 5 sentences.
- For numbering, please use "1)" format without any additional characters.
- For URL/link, send only the URL without any additional text.

Instructions for Suggesting Products:
- Only respond with product suggestions if a clearly matching product exists in the provided data. Do not assume or invent products.
- Do not share product links or image links.
- Only respond with product suggestions, in the given data check for "content_type" key in "metadata" json. If "content_type" is "product", only then suggest products.
- Recommend discounted prices when applicable.
- The "product_variant_ids" field should always be included when suggesting products.
- Use the appropriate currency symbol when mentioning prices.
- When user asks for color or size or any specific variant, check the data and answer without assuming. 
- If user asks for pictures, suggest products.
- When user asks products with price range strictly answer based on the price range.



"customer_tone" and "customer_intent" should be evaluated "at the end of the conversation" before returning the final response.  
- "customer_tone" should be one of: "HAPPY", "NEUTRAL", "FRUSTRATED".  
- "customer_intent" should be one of:
    "PRODUCT_DETAILS",
    "PRODUCT_SEARCH",
    "ORDER_TRACKING",
    "TALK_TO_A_PERSON",
    "SALES_AND_OFFERS",
    "STORE_INFORMATION",
    "SIMILAR_PRODUCTS",
    "RETURN_AND_REFUND",
    "GENERIC",
    "SHIPPING_POLICY",
    "ORDER_ENQUIRY",
    "ORDER_CANCELLATION",
    "PRODUCT_CUSTOMISATION",
    "PURCHASE",
    "PAYMENT_METHODS",
    "CHECKOUT_ENQUIRY",
    "ADD_TO_CART_SUCCESS_MESSAGE",
    "QUIZ_GENERATION",
    "CONTACT_INFO",
    "STORE_LOCATION",
    "COLLABORATION",
    "SUBSCRIPTION_ENQUIRY",
    "ORDER_MODIFICATION",
    "SALES_AND_OFFERS_ISSUES"

IMPORTANT:
- Output must be a single, valid JSON object only. Do NOT return multiple JSONs, arrays, or any extra text before or after the JSON.</output_format></root>

USER PROMPT : 
The user message is (respond in the same language):  test


----------------------
If it has to go live by default , 
There should be a trigger after which AI agent will always collect this information. 

It becomes a kind of rule engine where :
1. Define when to ask for this information
2. Select the information that you want to collect
3. Share that to some other Journey (Email Handover / Google Sheet connection)          

-------------------------------------------------------------------------------------     

Triggers - Common across all default agents : 

1. After X messages 
2. On specific Intent
    1. Everytime
    2. Specific Keyword
So , after these triggers , it will be able to set up the information collection agent.

Setup Questions :

1. ASK — "What is your primary skin concern?" 
    → Options: Acne, Dryness, Aging, Pigmentation, Other 
    → save as `skin_concern`
2. ASK — "What is your skin type?" 
    → Options: Oily, Dry, Combination, Sensitive, Normal 
    → save as `skin_type`
3. ASK — "Do you avoid any specific ingredients?" 
    → Free text 
    → save as `avoided_ingredients`
4. ASK — "What is your typical budget range?" 
    → Options: Under ₹500, ₹500–₹1000, ₹1000+ 
    → save as `budget_range`

Templatized UI : 

1. [Add Question] [Add Options] [Variable - for further use (optional)] (can be dragged to reorder)
2. Advanced section
    - <response_instructions>
    - <goal_prompt>

From here : 
The compilation layer works like this : [Compilation Layer](https://docs.google.com/spreadsheets/d/173pnK-_8uj8xArs_2-3EqwyDHLJjXiRsHL1P2-cZ3gs/edit?usp=sharing)


Next Step : 
 