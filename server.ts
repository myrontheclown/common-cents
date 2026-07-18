/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST API for financial insights
app.post('/api/insights', async (req, res) => {
  try {
    const { transactions, budgets, accounts, preferences, subscriptions } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      console.log('Gemini API key is not configured. Serving fallback insights.');
      return res.json({
        success: true,
        isOffline: true,
        insights: [
          {
            id: 'in-offline-1',
            date: new Date().toISOString().split('T')[0],
            type: 'tip',
            title: 'Config-Mode: High Yield Savings',
            summary: 'Boost checking account yields instantly.',
            detail: 'Activate your server-side GEMINI_API_KEY in the Secrets panel to unlock neural spending analytics. Meanwhile, we suggest transferring checking deposits above 3 months of runway into High-Yield vaults yielding >7.25% APY.',
            impactValue: '+₹35,000/yr',
            actionableStep: 'Enable your Gemini API Key in the upper right Settings > Secrets menu.'
          },
          {
            id: 'in-offline-2',
            date: new Date().toISOString().split('T')[0],
            type: 'warning',
            title: 'Budget Alert: Subscription Drag',
            summary: 'Subscriptions represent a recurring cash leak.',
            detail: 'You have active subscriptions. Check your LEDGER list to audit recurring SaaS debits. Cancelling just one unused service can save thousands annually.',
            impactValue: '-₹10,000/yr',
            actionableStep: 'Toggle active flags in LEDGER settings to model savings.'
          }
        ]
      });
    }

    // Format financial snapshot for Gemini
    const snapshotStr = `
      User: ${preferences?.name || 'User'}
      Monthly Savings Goal: ₹${preferences?.monthlySavingsGoal || 50000}
      Accounts: ${JSON.stringify(accounts?.map((a: any) => ({ name: a.name, type: a.type, balance: a.balance })))}
      Budgets: ${JSON.stringify(budgets?.map((b: any) => ({ category: b.category, limit: b.limit, spent: b.spent })))}
      Subscriptions: ${JSON.stringify(subscriptions?.map((s: any) => ({ service_name: s.service_name || s.name, amount: s.amount, billing_cycle: s.billing_cycle || s.frequency, active: s.active ?? s.isActive })))}
      Recent Transactions: ${JSON.stringify(transactions?.slice(0, 15).map((t: any) => ({ description: t.description, amount: t.amount, category: t.category, type: t.type, date: t.date })))}
    `;

    const prompt = `
      You are COMMON CENTS, an advanced, highly pragmatic personal financial intelligence algorithm for Indian Rupee (INR) cashflows.
      Analyze the following financial snapshot of the user and generate EXACTLY 3 highly actionable, non-trivial financial insights.
      
      Requirements for insights:
      1. Include precisely 3 items of types: 'tip', 'warning', 'celebration', or 'analysis'.
      2. Keep titles and summaries extremely punchy and "neubrutalist" (direct, bold, intellectual, aesthetic).
      3. For 'tip', look for actual financial gains (HYSAs, interest sweeps, asset rebalancing).
      4. For 'warning', highlight velocity limit breaches (such as categories on track to burst, subscription leaks, or balance drag).
      5. Provide an actionable step and an impact calculation (e.g. "+₹15,000/yr" or "-₹2,500/mo") if applicable.
      
      Use Indian Rupee (₹) and Indian numbering system where applicable. Do NOT use "$" symbol under any circumstances.

      Here is the user's data:
      ${snapshotStr}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                description: "Must be exactly one of: tip, warning, celebration, analysis" 
              },
              title: { type: Type.STRING, description: "Max 40 characters" },
              summary: { type: Type.STRING, description: "Max 80 characters" },
              detail: { type: Type.STRING, description: "Rich details explaining the financial math or behavior" },
              impactValue: { type: Type.STRING, description: "e.g. +₹35,000/yr or -₹4,500/mo" },
              actionableStep: { type: Type.STRING, description: "Exact human task to execute" }
            },
            required: ['type', 'title', 'summary', 'detail', 'actionableStep']
          }
        }
      }
    });

    const text = response.text || '[]';
    const parsedInsights = JSON.parse(text).map((item: any, idx: number) => ({
      ...item,
      id: `ai-${Date.now()}-${idx}`,
      date: new Date().toISOString().split('T')[0]
    }));

    return res.json({
      success: true,
      isOffline: false,
      insights: parsedInsights
    });

  } catch (err: any) {
    console.error('Error in /api/insights:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate insights: ' + err.message
    });
  }
});

// Start full-stack server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`COMMON CENTS Server running on http://localhost:${PORT}`);
  });
}

startServer();
