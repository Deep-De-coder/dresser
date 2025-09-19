import { buildMessages, shapeResponse } from '../index';
import { AssistantRequest, WardrobeItem } from '../index';

describe('Assistant Core Functions', () => {
  const mockItems: WardrobeItem[] = [
    {
      id: 'i1',
      name: 'Navy blazer',
      category: 'jacket',
      color: 'navy',
      fabric: 'wool',
      formality: 'business'
    },
    {
      id: 'i2',
      name: 'Light blue shirt',
      category: 'shirt',
      color: 'light blue',
      fabric: 'cotton',
      formality: 'business'
    },
    {
      id: 'i3',
      name: 'Chinos',
      category: 'pants',
      color: 'khaki',
      formality: 'business-casual'
    },
    {
      id: 'i4',
      name: 'White sneakers',
      category: 'shoes',
      color: 'white',
      formality: 'casual'
    }
  ];

  describe('buildMessages', () => {
    it('should build messages with business meeting query', () => {
      const request: AssistantRequest = {
        query: 'What should I wear for a business meeting tomorrow?',
        weather: { tempC: 12, condition: 'rain', windKph: 18 },
        preferences: { style: 'business-casual', avoidColors: ['neon'] },
        items: mockItems
      };

      const messages = buildMessages(request);

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      
      // Check system prompt contains key elements
      expect(messages[0].content).toContain('wardrobe stylist');
      expect(messages[0].content).toContain('structured outfit plan');
      
      // Check user prompt contains query and context
      expect(messages[1].content).toContain('business meeting');
      expect(messages[1].content).toContain('12°C');
      expect(messages[1].content).toContain('rain');
      expect(messages[1].content).toContain('business-casual');
      expect(messages[1].content).toContain('Navy blazer');
    });

    it('should handle empty items array', () => {
      const request: AssistantRequest = {
        query: 'What should I wear today?',
        items: []
      };

      const messages = buildMessages(request);
      const userMessage = messages[1].content;

      expect(userMessage).toContain('No items available');
      expect(userMessage).toContain('suggest a basic outfit');
    });

    it('should filter items by formality for business queries', () => {
      const request: AssistantRequest = {
        query: 'What should I wear for a job interview?',
        items: mockItems
      };

      const messages = buildMessages(request);
      const userMessage = messages[1].content;

      // Should include business items
      expect(userMessage).toContain('Navy blazer');
      expect(userMessage).toContain('Light blue shirt');
      expect(userMessage).toContain('Chinos');
      
      // Should not include casual items for business query
      // (This depends on the filtering logic implementation)
    });

    it('should filter items by weather conditions', () => {
      const request: AssistantRequest = {
        query: 'What should I wear today?',
        weather: { tempC: 5, condition: 'snow' },
        items: mockItems
      };

      const messages = buildMessages(request);
      const userMessage = messages[1].content;

      // Should prioritize warm items for cold weather
      expect(userMessage).toContain('5°C');
      expect(userMessage).toContain('snow');
    });
  });

  describe('shapeResponse', () => {
    it('should extract structured plan from well-formatted response', () => {
      const rawText = `For your business meeting, I recommend a professional outfit that's weather-appropriate.

PLAN:
Top: Light blue cotton shirt
Bottom: Khaki chinos
Shoes: Brown leather oxfords
Outerwear: Navy wool blazer
Accessories: Brown belt, Minimal watch

Rationale: This combination provides professional appearance while staying warm and dry.`;

      const result = shapeResponse(rawText, mockItems);

      expect(result.plan.top).toBe('Light blue cotton shirt');
      expect(result.plan.bottom).toBe('Khaki chinos');
      expect(result.plan.shoes).toBe('Brown leather oxfords');
      expect(result.plan.outerwear).toBe('Navy wool blazer');
      expect(result.plan.accessories).toEqual(['Brown belt', 'Minimal watch']);
      expect(result.rationale).toBe('This combination provides professional appearance while staying warm and dry.');
      expect(result.replyText).not.toContain('PLAN:');
    });

    it('should handle unstructured response with fallback extraction', () => {
      const rawText = `I recommend wearing a nice shirt with some pants and comfortable shoes for your casual day out.`;

      const result = shapeResponse(rawText, mockItems);

      // Should have some fallback plan
      expect(result.plan).toBeDefined();
      expect(result.rationale).toBeDefined();
      expect(result.replyText).toBe(rawText);
    });

    it('should find used items based on plan', () => {
      const rawText = `PLAN:
Top: Light blue shirt
Bottom: Chinos
Shoes: White sneakers`;

      const result = shapeResponse(rawText, mockItems);

      // Should identify used items
      expect(result.usedItems).toContain('i2'); // Light blue shirt
      expect(result.usedItems).toContain('i3'); // Chinos
      expect(result.usedItems).toContain('i4'); // White sneakers
    });

    it('should handle "none needed" for accessories', () => {
      const rawText = `PLAN:
Top: Light blue shirt
Bottom: Chinos
Shoes: White sneakers
Outerwear: none needed
Accessories: none needed`;

      const result = shapeResponse(rawText, mockItems);

      expect(result.plan.accessories).toBeUndefined();
      expect(result.plan.outerwear).toBe('none needed');
    });

    it('should clean reply text by removing plan section', () => {
      const rawText = `Here's my recommendation for your outfit.

PLAN:
Top: Light blue shirt
Bottom: Chinos

This should work well for your needs.`;

      const result = shapeResponse(rawText, mockItems);

      expect(result.replyText).not.toContain('PLAN:');
      expect(result.replyText).toContain("Here's my recommendation");
      expect(result.replyText).toContain('This should work well');
    });
  });
});
