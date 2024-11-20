import { PublicationService } from './publication.service';

describe('PublicationService', () => {
  describe('toTsQuery', () => {
    it('should return a valid tsquery', () => {
      const result = PublicationService.toTsQuery('test query', 'OR');
      expect(result).toBe('test:* | query:*');
    });
    it('should filter out empty/blank strings', () => {
      const result = PublicationService.toTsQuery('   test    query  ', 'OR');
      expect(result).toBe('test:* | query:*');
    });
    it('should remove special characters', () => {
      const result = PublicationService.toTsQuery('test!&%$§"§ query', 'OR');
      expect(result).toBe('test:* | query:*');
    });
    it('should return a valid tsquery with AND', () => {
      const result = PublicationService.toTsQuery('test query', 'AND');
      expect(result).toBe('test:* & query:*');
    });
  });
});
