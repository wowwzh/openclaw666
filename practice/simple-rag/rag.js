/**
 * 绠€鍗昍AG绯荤粺 - 绾墠绔疄鐜? * 浣跨敤鏁扮粍妯℃嫙鍚戦噺瀛樺偍锛屽疄鐜版枃妗ｅ姞杞姐€佸垎鍧椼€佸悜閲忓寲銆佺浉浼煎害鎼滅储
 */

// ==================== 1. 鏂囨。鍔犺浇涓庡垎鍧?====================

/**
 * 妯℃嫙鏂囨。鍔犺浇锛堜粠棰勮鏂囨。姹犲姞杞斤級
 */
const loadDocuments = () => {
    const documents = [
        {
            id: 1,
            title: "JavaScript 鍩虹",
            content: `JavaScript 鏄竴绉嶈交閲忕骇鐨勩€佽В閲婂瀷鐨勩€侀潰鍚戝璞＄殑缂栫▼璇█銆傚畠鏄疻eb椤甸潰鐨勮剼鏈瑷€锛岃骞挎硾搴旂敤浜庡鎴风寮€鍙戙€侸avaScript 鍙互宓屽叆鍒癏TML涓紝鍦ㄦ祻瑙堝櫒涓墽琛屻€侸avaScript 鐨勬牳蹇冪壒鐐瑰寘鎷細鍔ㄦ€佺被鍨嬨€佸熀浜庡璞°€佸嚱鏁板紡缂栫▼銆佸師鍨嬬户鎵跨瓑銆俙
        },
        {
            id: 2,
            title: "Python 鍏ラ棬",
            content: `Python 鏄竴绉嶉珮绾с€佽В閲婂瀷銆侀潰鍚戝璞＄殑缂栫▼璇█銆侾ython 鐨勮璁″摬瀛﹀己璋冧唬鐮佺殑鍙鎬э紝鍏惰娉曞厑璁哥▼搴忓憳鐢ㄦ洿灏戠殑浠ｇ爜琛ㄨ揪鎯虫硶銆侾ython 鏀寔澶氱缂栫▼鑼冨紡锛屽寘鎷粨鏋勫寲銆佽繃绋嬪紡銆佸弽灏勫紡銆侀潰鍚戝璞″拰鍑芥暟寮忕紪绋嬨€侾ython 鎷ユ湁涓板瘜鑰屽己澶х殑鏍囧噯搴撱€俙
        },
        {
            id: 3,
            title: "鍓嶇寮€鍙戞杩?,
            content: `鍓嶇寮€鍙戞槸鎸囧垱寤篧eb椤甸潰鎴栧簲鐢ㄧ殑鐢ㄦ埛鐣岄潰鍜岀敤鎴蜂綋楠岀殑杩囩▼銆備富瑕佹妧鏈寘鎷琀TML銆丆SS鍜孞avaScript銆侶TML璐熻矗缁撴瀯锛孋SS璐熻矗鏍峰紡锛孞avaScript璐熻矗浜や簰琛屼负銆傜幇浠ｅ墠绔紑鍙戣繕娑夊強React銆乂ue銆丄ngular绛夋鏋讹紝浠ュ強Webpack銆乂ite绛夋瀯寤哄伐鍏枫€俙
        },
        {
            id: 4,
            title: "鍚庣寮€鍙戠畝浠?,
            content: `鍚庣寮€鍙戞槸鎸囨湇鍔″櫒绔殑寮€鍙戯紝娑夊強鏁版嵁搴撱€佹湇鍔″櫒鍜屽簲鐢ㄧ▼搴忕殑閫昏緫澶勭悊銆傚父鐢ㄧ殑鍚庣璇█鍖呮嫭Java銆丳ython銆丯ode.js銆丟o绛夈€傚悗绔紑鍙戦渶瑕佸鐞嗘暟鎹瓨鍌ㄣ€佷笟鍔￠€昏緫銆丄PI璁捐銆佹€ц兘浼樺寲绛夐棶棰樸€傚父瑙佺殑鍚庣妗嗘灦鏈塖pring銆丏jango銆丒xpress绛夈€俙
        },
        {
            id: 5,
            title: "鏁版嵁搴撳熀纭€",
            content: `鏁版嵁搴撴槸鎸夌収鏁版嵁缁撴瀯鏉ョ粍缁囥€佸瓨鍌ㄥ拰绠＄悊鏁版嵁鐨勪粨搴撱€傚父瑙佺殑鍏崇郴鍨嬫暟鎹簱鍖呮嫭MySQL銆丳ostgreSQL銆丱racle绛夈€傞潪鍏崇郴鍨嬫暟鎹簱鍖呮嫭MongoDB銆丷edis銆丆assandra绛夈€傛暟鎹簱璁捐闇€瑕侀伒寰寖寮忕悊璁猴紝鍚屾椂涔熻鑰冭檻鎬ц兘鍥犵礌銆係QL鏄搷浣滃叧绯诲瀷鏁版嵁搴撶殑鏍囧噯璇█銆俙
        },
        {
            id: 6,
            title: "鏈哄櫒瀛︿範鍏ラ棬",
            content: `鏈哄櫒瀛︿範鏄汉宸ユ櫤鑳界殑涓€涓垎鏀紝涓撻棬鐮旂┒璁＄畻鏈烘€庢牱妯℃嫙鎴栧疄鐜颁汉绫荤殑瀛︿範琛屼负锛屼互鑾峰彇鏂扮殑鐭ヨ瘑鎴栨妧鑳斤紝閲嶆柊缁勭粐宸叉湁鐨勭煡璇嗙粨鏋勪娇涔嬩笉鏂敼鍠勮嚜韬殑鎬ц兘銆傛満鍣ㄥ涔犲垎涓虹洃鐫ｅ涔犮€佹棤鐩戠潱瀛︿範鍜屽己鍖栧涔犱笁绫汇€傚父瑙佺殑绠楁硶鍖呮嫭绾挎€у洖褰掋€佸喅绛栨爲銆佺缁忕綉缁滅瓑銆俙
        },
        {
            id: 7,
            title: "娣卞害瀛︿範姒傝堪",
            content: `娣卞害瀛︿範鏄満鍣ㄥ涔犵殑涓€涓垎鏀紝瀹冩槸涓€绉嶄互浜哄伐绁炵粡缃戠粶涓烘灦鏋勶紝瀵规暟鎹繘琛岃〃寰佸涔犵殑绠楁硶銆傛繁搴﹀涔犲湪璁＄畻鏈鸿瑙夈€佽闊宠瘑鍒€佽嚜鐒惰瑷€澶勭悊绛夐鍩熷彇寰椾簡绐佺牬鎬ц繘灞曘€傚父瑙佺殑娣卞害瀛︿範妗嗘灦鍖呮嫭TensorFlow銆丳yTorch銆並eras绛夈€傚嵎绉缁忕綉缁滃拰寰幆绁炵粡缃戠粶鏄繁搴﹀涔犵殑缁忓吀鏋舵瀯銆俙
        },
        {
            id: 8,
            title: "Web API 璁捐",
            content: `Web API 鏄簲鐢ㄧ▼搴忔帴鍙ｇ殑涓€绉嶏紝鐢ㄤ簬涓嶅悓杞欢绯荤粺涔嬮棿鐨勯€氫俊銆俁ESTful API 鏄洰鍓嶆渶娴佽鐨刉eb API璁捐椋庢牸锛屽畠浣跨敤HTTP鏂规硶锛圙ET銆丳OST銆丳UT銆丏ELETE锛夊璧勬簮杩涜鎿嶄綔銆侫PI璁捐闇€瑕佽€冭檻瀹夊叏鎬с€佺増鏈帶鍒躲€侀敊璇鐞嗐€佹枃妗ｅ寲绛夋柟闈€傚父鐢ㄧ殑璁よ瘉鏂瑰紡鍖呮嫭JWT銆丱Auth绛夈€俙
        }
    ];
    return documents;
};

/**
 * 鏂囨。鍒嗗潡 - 灏嗛暱鏂囨。鍒嗗壊鎴愯緝灏忕殑鍧? * @param {string} text - 鏂囨。鍐呭
 * @param {number} chunkSize - 鍧楀ぇ灏? * @param {number} overlap - 閲嶅彔澶у皬
 */
const chunkDocument = (text, chunkSize = 100, overlap = 20) => {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim()) {
            chunks.push(chunk);
        }
    }
    
    return chunks;
};

// ==================== 2. 鍚戦噺鍖?====================

/**
 * 绠€鍗曠殑璇嶈妯″瀷鍚戦噺鍖? * 灏嗘枃鏈浆鎹负鍚戦噺琛ㄧず
 */
class SimpleVectorizer {
    constructor() {
        this.vocabulary = new Map();
        this.vocabularySize = 0;
    }
    
    /**
     * 鏋勫缓璇嶆眹琛?     * @param {string[]} texts - 鏂囨湰鏁扮粍
     */
    buildVocabulary(texts) {
        const wordFreq = new Map();
        
        // 缁熻鎵€鏈夋枃妗ｇ殑璇嶉
        texts.forEach(text => {
            const words = this.tokenize(text);
            words.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });
        });
        
        // 鎸夐鐜囨帓搴忥紝鍙栧墠1000涓瘝浣滀负璇嶆眹琛?        const sortedWords = [...wordFreq.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1000)
            .map(([word]) => word);
        
        // 鏋勫缓璇嶆眹琛ㄧ储寮?        sortedWords.forEach((word, index) => {
            this.vocabulary.set(word, index);
        });
        
        this.vocabularySize = this.vocabulary.size;
        console.log(`璇嶆眹琛ㄦ瀯寤哄畬鎴愶紝鍏?${this.vocabularySize} 涓瘝`);
    }
    
    /**
     * 鍒嗚瘝
     * @param {string} text - 鏂囨湰
     */
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }
    
    /**
     * 灏嗘枃鏈浆鎹负鍚戦噺
     * @param {string} text - 鏂囨湰
     */
    vectorize(text) {
        const vector = new Array(this.vocabularySize).fill(0);
        const words = this.tokenize(text);
        
        // TF (璇嶉)
        const wordCount = new Map();
        words.forEach(word => {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
        
        // 濉厖鍚戦噺
        wordCount.forEach((count, word) => {
            if (this.vocabulary.has(word)) {
                const index = this.vocabulary.get(word);
                // 浣跨敤TF-IDF鏉冮噸锛堢畝鍖栫増鏈紝鍙敤TF锛?                vector[index] = count / words.length;
            }
        });
        
        return vector;
    }
}

// ==================== 3. 鍚戦噺瀛樺偍锛堟暟缁勬ā鎷燂級 ====================

class VectorStore {
    constructor() {
        this.chunks = [];           // 瀛樺偍鏂囨湰鍧?        this.vectors = [];         // 瀛樺偍瀵瑰簲鐨勫悜閲?        this.metadata = [];        // 瀛樺偍鍏冩暟鎹?    }
    
    /**
     * 娣诲姞鏂囨。鍒板悜閲忓瓨鍌?     * @param {Object} doc - 鏂囨。瀵硅薄
     * @param {string[]} chunkTexts - 鍒嗗潡鍚庣殑鏂囨湰鏁扮粍
     * @param {SimpleVectorizer} vectorizer - 鍚戦噺鍖栧櫒
     */
    addDocument(doc, chunkTexts, vectorizer) {
        chunkTexts.forEach((chunkText, index) => {
            this.chunks.push(chunkText);
            this.vectors.push(vectorizer.vectorize(chunkText));
            this.metadata.push({
                docId: doc.id,
                title: doc.title,
                chunkIndex: index
            });
        });
    }
    
    /**
     * 鑾峰彇鍚戦噺涓暟
     */
    get size() {
        return this.vectors.length;
    }
}

// ==================== 4. 鐩镐技搴︽悳绱?====================

/**
 * 璁＄畻浣欏鸡鐩镐技搴? * @param {number[]} vec1 - 鍚戦噺1
 * @param {number[]} vec2 - 鍚戦噺2
 */
const cosineSimilarity = (vec1, vec2) => {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

/**
 * 鐩镐技搴︽悳绱? * @param {VectorStore} store - 鍚戦噺瀛樺偍
 * @param {number[]} queryVector - 鏌ヨ鍚戦噺
 * @param {number} topK - 杩斿洖鍓岾涓粨鏋? */
const searchSimilar = (store, queryVector, topK = 3) => {
    const results = store.vectors.map((vector, index) => ({
        index,
        chunk: store.chunks[index],
        metadata: store.metadata[index],
        similarity: cosineSimilarity(queryVector, vector)
    }));
    
    // 鎸夌浉浼煎害鎺掑簭
    results.sort((a, b) => b.similarity - a.similarity);
    
    // 杩斿洖鍓岾涓粨鏋?    return results.slice(0, topK);
};

// ==================== 5. 闂瓟绯荤粺 ====================

class SimpleRAG {
    constructor() {
        this.vectorizer = new SimpleVectorizer();
        this.vectorStore = new VectorStore();
        this.initialized = false;
    }
    
    /**
     * 鍒濆鍖朢AG绯荤粺
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('姝ｅ湪鍒濆鍖朢AG绯荤粺...');
        
        // 1. 鍔犺浇鏂囨。
        const documents = loadDocuments();
        console.log(`鍔犺浇浜?${documents.length} 涓枃妗);
        
        // 2. 瀵规墍鏈夋枃妗ｅ唴瀹硅繘琛屽垎璇嶏紝鏋勫缓璇嶆眹琛?        const allContents = documents.map(doc => doc.content);
        this.vectorizer.buildVocabulary(allContents);
        
        // 3. 鍒嗗潡骞舵坊鍔犲埌鍚戦噺瀛樺偍
        documents.forEach(doc => {
            const chunks = chunkDocument(doc.content, 80, 15);
            this.vectorStore.addDocument(doc, chunks, this.vectorizer);
        });
        
        console.log(`鍚戦噺瀛樺偍宸叉瀯寤猴紝鍏?${this.vectorStore.size} 涓悜閲廯);
        
        this.initialized = true;
        console.log('RAG绯荤粺鍒濆鍖栧畬鎴愶紒');
    }
    
    /**
     * 闂瓟
     * @param {string} query - 鐢ㄦ埛闂
     * @param {number} topK - 妫€绱㈢殑鏂囨。鍧楁暟
     */
    async query(query, topK = 3) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        // 1. 灏嗘煡璇㈠悜閲忓寲
        const queryVector = this.vectorizer.vectorize(query);
        
        // 2. 鐩镐技搴︽悳绱?        const results = searchSimilar(this.vectorStore, queryVector, topK);
        
        // 3. 鐢熸垚鍥炵瓟锛堢畝鍗曟嫾鎺ユ绱㈠埌鐨勫唴瀹癸級
        let answer = '';
        let context = '';
        
        results.forEach((result, index) => {
            context += `\n銆愭枃妗?{index + 1}銆?{result.metadata.title}\n${result.chunk}\n`;
        });
        
        // 绠€鍗曠殑鍥炵瓟鐢熸垚锛堝疄闄呴」鐩腑鍙互璋冪敤LLM API锛?        answer = this.generateAnswer(query, results);
        
        return {
            answer,
            sources: results.map(r => ({
                title: r.metadata.title,
                content: r.chunk,
                similarity: r.similarity
            }))
        };
    }
    
    /**
     * 鐢熸垚鍥炵瓟锛堢畝鍖栫増鏈級
     */
    generateAnswer(query, results) {
        if (results.length === 0) {
            return '鎶辨瓑锛屾垜娌℃湁鎵惧埌鐩稿叧鐨勬枃妗ｆ潵鍥炵瓟鎮ㄧ殑闂銆?;
        }
        
        const topResult = results[0];
        
        // 鏍规嵁鏌ヨ鍏抽敭璇嶇敓鎴愮畝鍗曞洖绛?        const lowerQuery = query.toLowerCase();
        let answer = '';
        
        if (lowerQuery.includes('javascript') || lowerQuery.includes('js')) {
            answer = '鍏充簬JavaScript锛屾牴鎹垜妫€绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('python')) {
            answer = '鍏充簬Python锛屾牴鎹垜妫€绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('鍓嶇') || lowerQuery.includes('html') || lowerQuery.includes('css')) {
            answer = '鍏充簬鍓嶇寮€鍙戯紝鏍规嵁鎴戞绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('鍚庣') || lowerQuery.includes('鏈嶅姟鍣?)) {
            answer = '鍏充簬鍚庣寮€鍙戯紝鏍规嵁鎴戞绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('鏁版嵁搴?) || lowerQuery.includes('sql')) {
            answer = '鍏充簬鏁版嵁搴擄紝鏍规嵁鎴戞绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('鏈哄櫒瀛︿範') || lowerQuery.includes('ai')) {
            answer = '鍏充簬鏈哄櫒瀛︿範锛屾牴鎹垜妫€绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('娣卞害瀛︿範') || lowerQuery.includes('绁炵粡缃戠粶')) {
            answer = '鍏充簬娣卞害瀛︿範锛屾牴鎹垜妫€绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else if (lowerQuery.includes('api')) {
            answer = '鍏充簬Web API锛屾牴鎹垜妫€绱㈠埌鐨勬枃妗ｏ細\n' + topResult.chunk;
        } else {
            // 榛樿杩斿洖鏈€鐩稿叧鐨勬枃妗ｅ唴瀹?            answer = '鏍规嵁妫€绱㈠埌鐨勭浉鍏冲唴瀹癸細\n' + topResult.chunk;
        }
        
        return answer;
    }
}

// 瀵煎嚭妯″潡
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SimpleRAG, VectorStore, SimpleVectorizer };
}


// SearchHistory class - 搜索历史类
class SearchHistory {
  constructor(maxSize = 10) {
    this.history = []
    this.maxSize = maxSize
  }
  add(query, result) {
    this.history.unshift({ query, timestamp: new Date().toLocaleString() })
    if (this.history.length > this.maxSize) this.history.pop()
  }
  getAll() { return this.history }
}
