import { serveDir, serveFile } from "@std/http";
import { join } from "@std/path";
import { ensureDir } from "@std/fs";

const DATA_DIR = "./data";
const STATIC_DIR = "./static";

// グローバル変数：起動時に入力されたユーザー名
let CURRENT_USERNAME = "";

// データディレクトリを確保
await ensureDir(DATA_DIR);
await ensureDir(join(DATA_DIR, "archives"));
await ensureDir(join(DATA_DIR, "players"));

// プレイヤー用のサブディレクトリを作成（a-z, 0-9, other）
const playerSubDirs = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'other'
];

for (const subDir of playerSubDirs) {
  await ensureDir(join(DATA_DIR, "players", subDir));
}

interface DataEntry<T> {
  data: T;
  timestamp: number;
  isCurrentMonth?: boolean;
}

class DiskStorage {
  private getPlayerSubDir(username: string): string {
    const firstChar = username.toLowerCase().charAt(0);
    if (firstChar >= 'a' && firstChar <= 'z') {
      return firstChar;
    } else if (firstChar >= '0' && firstChar <= '9') {
      return firstChar;
    } else {
      return 'other';
    }
  }

  private getDataPath(key: string): string {
    const cleanKey = key.replace(/[^a-zA-Z0-9-_]/g, "_");
    if (key.startsWith("archive-")) {
      // 新しいアーカイブファイル名形式: username_YYYY_MM.json
      // キーから username, year, month を抽出
      const match = key.match(/archive-(.+)-(\d{4})-(\d{2})$/);
      if (match) {
        const [, username, year, month] = match;
        return join(DATA_DIR, "archives", `${username}_${year}_${month}.json`);
      }
      // 旧形式のフォールバック
      return join(DATA_DIR, "archives", `${cleanKey}.json`);
    } else if (key.startsWith("player-")) {
      // 新しいプレイヤーファイル名形式: username.json
      // キーから username を抽出
      const username = key.substring(7); // "player-" を除去
      const subDir = this.getPlayerSubDir(username);
      return join(DATA_DIR, "players", subDir, `${username}.json`);
    } else {
      return join(DATA_DIR, `${cleanKey}.json`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const path = this.getDataPath(key);
      const content = await Deno.readTextFile(path);
      const entry: DataEntry<T> = JSON.parse(content);
      
      // データの有効期限チェック
      const now = Date.now();
      const maxAge = entry.isCurrentMonth ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000; // 当月は30分、それ以外は24時間
      
      if (now - entry.timestamp > maxAge) {
        await this.remove(key);
        return null;
      }
      
      return entry.data;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, isCurrentMonth = false): Promise<void> {
    try {
      const path = this.getDataPath(key);
      const entry: DataEntry<T> = {
        data: value,
        timestamp: Date.now(),
        isCurrentMonth
      };
      await Deno.writeTextFile(path, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error(`Failed to write data for ${key}:`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const path = this.getDataPath(key);
      await Deno.remove(path);
    } catch {
      // ファイルが存在しない場合は無視
    }
  }

  async clear(): Promise<void> {
    try {
      await Deno.remove(DATA_DIR, { recursive: true });
      await ensureDir(DATA_DIR);
      await ensureDir(join(DATA_DIR, "archives"));
      await ensureDir(join(DATA_DIR, "players"));
      
      // プレイヤー用のサブディレクトリを再作成
      const playerSubDirs = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'other'
      ];
      
      for (const subDir of playerSubDirs) {
        await ensureDir(join(DATA_DIR, "players", subDir));
      }
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  }
}

const storage = new DiskStorage();

// 取得済み期間を調べる関数
async function getAvailablePeriods(username: string): Promise<string[]> {
  const archivesDir = join(DATA_DIR, "archives");
  const periods: string[] = [];
  
  try {
    for await (const dirEntry of Deno.readDir(archivesDir)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
        // ファイル名の形式: username_YYYY_MM.json
        const match = dirEntry.name.match(/^(.+)_(\d{4})_(\d{2})\.json$/);
        if (match && match[1] === username) {
          const [, , year, month] = match;
          periods.push(`${year}年${month}月`);
        }
      }
    }
    
    // 期間を時系列順にソート
    periods.sort((a, b) => {
      const aMatch = a.match(/(\d{4})年(\d{2})月/);
      const bMatch = b.match(/(\d{4})年(\d{2})月/);
      if (aMatch && bMatch) {
        const aDate = parseInt(aMatch[1]) * 100 + parseInt(aMatch[2]);
        const bDate = parseInt(bMatch[1]) * 100 + parseInt(bMatch[2]);
        return aDate - bDate;
      }
      return 0;
    });
    
  } catch (error) {
    console.error('Error reading archives directory:', error);
  }
  
  return periods;
}

// Chess.comから全期間を取得する関数
async function getAllAvailablePeriods(username: string): Promise<Array<{period: string, year: number, month: number}>> {
  const apiUrl = `https://api.chess.com/pub/player/${username}/games/archives`;
  const periods: Array<{period: string, year: number, month: number}> = [];
  
  try {
    const archivesResponse = await fetch(apiUrl);
    if (!archivesResponse.ok) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const archivesData = await archivesResponse.json();
    const archives = archivesData.archives || [];
    
    for (const archiveUrl of archives) {
      const match = archiveUrl.match(/\/(\d{4})\/(\d{2})$/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        periods.push({
          period: `${year}年${String(month).padStart(2, '0')}月`,
          year,
          month
        });
      }
    }
    
    // 時系列順にソート
    periods.sort((a, b) => {
      const aDate = a.year * 100 + a.month;
      const bDate = b.year * 100 + b.month;
      return aDate - bDate;
    });
    
  } catch (error) {
    console.error('Error fetching all periods:', error);
    throw error;
  }
  
  return periods;
}

// Chess.com APIからデータを取得
async function fetchChessData(username: string, monthsBack: number | string | {type: string, periods: string[]} = 3) {
  let targetArchives: string[] = [];
  let logMessage = '';
  
  const apiUrl = `https://api.chess.com/pub/player/${username}/games/archives`;
  
  try {
    // アーカイブリストを取得
    const archivesResponse = await fetch(apiUrl);
    if (!archivesResponse.ok) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const archivesData = await archivesResponse.json();
    const archives = archivesData.archives || [];
    
    if (archives.length === 0) {
      throw new Error('ゲームデータが見つかりません');
    }
    
    // 期間に応じてアーカイブを選択
    if (monthsBack === 'all') {
      targetArchives = archives;
      logMessage = 'all periods';
    } else if (typeof monthsBack === 'object' && monthsBack.type === 'selected') {
      // 選択された期間のみ
      const selectedPeriods = monthsBack.periods;
      targetArchives = archives.filter(archive => {
        return selectedPeriods.some(period => archive.includes(period));
      });
      logMessage = `selected periods: ${selectedPeriods.join(', ')}`;
    } else {
      targetArchives = archives.slice(-monthsBack as number);
      logMessage = monthsBack + ' months';
    }
    
    console.log(`Starting efficient data fetch for: ${username}, ${logMessage}`);
    
    const recentArchives = targetArchives;
    const allGames = [];
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    for (const archiveUrl of recentArchives) {
      try {
        // 新しいキー形式: archive-username-YYYY-MM
        const urlMatch = archiveUrl.match(/\/player\/([^\/]+)\/games\/(\d{4})\/(\d{2})$/);
        if (!urlMatch) {
          console.error(`Invalid archive URL format: ${archiveUrl}`);
          continue;
        }
        const [, urlUsername, year, month] = urlMatch;
        const archiveCacheKey = `archive-${username}-${year}-${month}`;
        const isCurrentMonth = archiveUrl.includes(currentYearMonth);
        
        let gamesData = await storage.get(archiveCacheKey);
        
        if (!gamesData) {
          console.log(`Fetching ${isCurrentMonth ? 'current month' : 'archived'} data: ${archiveUrl}`);
          
          const gamesResponse = await fetch(archiveUrl);
          if (gamesResponse.ok) {
            gamesData = await gamesResponse.json();
            await storage.set(archiveCacheKey, gamesData, isCurrentMonth);
            
            console.log(`Saved archive data: ${gamesData.games?.length || 0} games`);
          }
        } else {
          console.log(`Using saved data for: ${archiveUrl}`);
        }
        
        if (gamesData && gamesData.games) {
          allGames.push(...gamesData.games);
        }
      } catch (error) {
        console.error('Error fetching archive:', archiveUrl, error);
      }
    }
    
    console.log(`Total games fetched: ${allGames.length}`);
    return allGames;
  } catch (error) {
    throw error;
  }
}

// プレイヤーの詳細情報を取得
async function fetchPlayerDetails(username: string) {
  const dataKey = `player-${username}`;
  
  let savedData = await storage.get(dataKey);
  if (savedData) {
    return savedData;
  }
  
  try {
    const response = await fetch(`https://api.chess.com/pub/player/${username}`);
    if (response.ok) {
      const data = await response.json();
      await storage.set(dataKey, data);
      return data;
    }
  } catch (error) {
    console.error(`Failed to fetch player details for ${username}:`, error);
  }
  return null;
}

// 対戦相手の国を抽出
async function extractOpponentCountries(games: any[], username: string) {
  const countries = new Map();
  
  console.log(`Total games found: ${games.length}`);
  
  const opponents = new Set();
  
  for (const game of games) {
    if (game.white && game.black) {
      if (game.white.username && game.white.username.toLowerCase() === username.toLowerCase()) {
        opponents.add(game.black.username);
      } else if (game.black.username && game.black.username.toLowerCase() === username.toLowerCase()) {
        opponents.add(game.white.username);
      }
    }
  }
  
  console.log(`Found ${opponents.size} unique opponents`);
  
  let processedCount = 0;
  for (const opponentUsername of opponents) {
    processedCount++;
    console.log(`Fetching details for opponent ${processedCount}/${opponents.size}: ${opponentUsername}`);
    
    const playerDetails = await fetchPlayerDetails(opponentUsername);
    
    if (playerDetails && playerDetails.country) {
      let countryCode;
      
      if (typeof playerDetails.country === 'string') {
        const parts = playerDetails.country.split('/');
        countryCode = parts[parts.length - 1];
      } else {
        countryCode = playerDetails.country;
      }
      
      if (countryCode && countryCode.length === 2) {
        countryCode = countryCode.toUpperCase();
        
        
        let gameCount = 0;
        for (const game of games) {
          if ((game.white?.username?.toLowerCase() === username.toLowerCase() && 
               game.black?.username?.toLowerCase() === opponentUsername.toLowerCase()) ||
              (game.black?.username?.toLowerCase() === username.toLowerCase() && 
               game.white?.username?.toLowerCase() === opponentUsername.toLowerCase())) {
            gameCount++;
          }
        }
        
        const existingCount = countries.get(countryCode) || 0;
        countries.set(countryCode, existingCount + gameCount);
        
        console.log(`Added ${gameCount} games for ${opponentUsername} from ${countryCode}`);
      }
    } else {
      console.log(`No country info found for ${opponentUsername}`);
    }
    
    if (processedCount % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('Countries found:', Array.from(countries.entries()));
  return countries;
}

// 特定ユーザーの既存データを読み込む関数
async function loadExistingDataForUser(targetUsername: string): Promise<Map<string, number>> {
  const countries = new Map<string, number>();
  
  try {
    const archivesDir = join(DATA_DIR, "archives");
    const allGames: any[] = [];
    
    // 指定されたユーザーのアーカイブファイルのみを読み込み
    try {
      for await (const dirEntry of Deno.readDir(archivesDir)) {
        if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
          const match = dirEntry.name.match(/^(.+)_\d{4}_\d{2}\.json$/);
          if (match && match[1].toLowerCase() === targetUsername.toLowerCase()) {
            try {
              const filePath = join(archivesDir, dirEntry.name);
              const content = await Deno.readTextFile(filePath);
              const archiveData = JSON.parse(content);
              
              if (archiveData.data && archiveData.data.games) {
                allGames.push(...archiveData.data.games);
              }
            } catch (error) {
              console.error(`Error reading archive file ${dirEntry.name}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading archives directory:', error);
    }
    
    if (allGames.length === 0) {
      return countries;
    }
    
    // 対戦相手を収集
    const opponents = new Set<string>();
    for (const game of allGames) {
      if (game.white && game.black) {
        if (game.white.username && game.white.username.toLowerCase() === targetUsername.toLowerCase()) {
          opponents.add(game.black.username);
        } else if (game.black.username && game.black.username.toLowerCase() === targetUsername.toLowerCase()) {
          opponents.add(game.white.username);
        }
      }
    }
    
    // プレイヤーの国情報を読み込み
    for (const opponentUsername of opponents) {
      try {
        const dataKey = `player-${opponentUsername}`;
        const playerData = await storage.get(dataKey);
        
        if (playerData && playerData.country) {
          let countryCode;
          if (typeof playerData.country === 'string') {
            const parts = playerData.country.split('/');
            countryCode = parts[parts.length - 1];
          } else {
            countryCode = playerData.country;
          }
          
          if (countryCode && countryCode.length === 2) {
            countryCode = countryCode.toUpperCase();
            
            // この対戦相手との対戦数を計算
            let gameCount = 0;
            for (const game of allGames) {
              if ((game.white?.username?.toLowerCase() === targetUsername.toLowerCase() && 
                   game.black?.username?.toLowerCase() === opponentUsername.toLowerCase()) ||
                  (game.black?.username?.toLowerCase() === targetUsername.toLowerCase() && 
                   game.white?.username?.toLowerCase() === opponentUsername.toLowerCase())) {
                gameCount++;
              }
            }
            
            const existingCount = countries.get(countryCode) || 0;
            countries.set(countryCode, existingCount + gameCount);
          }
        }
      } catch (error) {
        console.error(`Error loading player data for ${opponentUsername}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error loading existing data for user:', error);
  }
  
  return countries;
}

// 既存データを読み込む関数
async function loadExistingData(): Promise<Map<string, number>> {
  const countries = new Map<string, number>();
  
  try {
    // archivesディレクトリ内の全てのファイルを読み込み
    const archivesDir = join(DATA_DIR, "archives");
    const playersDir = join(DATA_DIR, "players");
    
    // アーカイブファイルから全ゲームデータを収集
    const allGames: any[] = [];
    
    try {
      for await (const dirEntry of Deno.readDir(archivesDir)) {
        if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
          try {
            const filePath = join(archivesDir, dirEntry.name);
            const content = await Deno.readTextFile(filePath);
            const archiveData = JSON.parse(content);
            
            if (archiveData.data && archiveData.data.games) {
              allGames.push(...archiveData.data.games);
            }
          } catch (error) {
            console.error(`Error reading archive file ${dirEntry.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading archives directory:', error);
    }
    
    if (allGames.length === 0) {
      return countries;
    }
    
    // ユーザー名を推定（最初のアーカイブファイルから）
    let username = '';
    try {
      for await (const dirEntry of Deno.readDir(archivesDir)) {
        if (dirEntry.isFile && dirEntry.name.endsWith('.json')) {
          const match = dirEntry.name.match(/^(.+)_\d{4}_\d{2}\.json$/);
          if (match) {
            username = match[1];
            break;
          }
        }
      }
    } catch (error) {
      // ユーザー名が取得できない場合は空のMapを返す
      return countries;
    }
    
    if (!username) {
      return countries;
    }
    
    // 対戦相手を収集
    const opponents = new Set<string>();
    for (const game of allGames) {
      if (game.white && game.black) {
        if (game.white.username && game.white.username.toLowerCase() === username.toLowerCase()) {
          opponents.add(game.black.username);
        } else if (game.black.username && game.black.username.toLowerCase() === username.toLowerCase()) {
          opponents.add(game.white.username);
        }
      }
    }
    
    // プレイヤーの国情報を読み込み
    for (const opponentUsername of opponents) {
      try {
        const dataKey = `player-${opponentUsername}`;
        const playerData = await storage.get(dataKey);
        
        if (playerData && playerData.country) {
          let countryCode;
          if (typeof playerData.country === 'string') {
            const parts = playerData.country.split('/');
            countryCode = parts[parts.length - 1];
          } else {
            countryCode = playerData.country;
          }
          
          if (countryCode && countryCode.length === 2) {
            countryCode = countryCode.toUpperCase();
            
            // この対戦相手との対戦数を計算
            let gameCount = 0;
            for (const game of allGames) {
              if ((game.white?.username?.toLowerCase() === username.toLowerCase() && 
                   game.black?.username?.toLowerCase() === opponentUsername.toLowerCase()) ||
                  (game.black?.username?.toLowerCase() === username.toLowerCase() && 
                   game.white?.username?.toLowerCase() === opponentUsername.toLowerCase())) {
                gameCount++;
              }
            }
            
            const existingCount = countries.get(countryCode) || 0;
            countries.set(countryCode, existingCount + gameCount);
          }
        }
      } catch (error) {
        console.error(`Error loading player data for ${opponentUsername}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error loading existing data:', error);
  }
  
  return countries;
}

// HTTPハンドラー
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  if (url.pathname === "/api/chess-data") {
    // サーバー起動時に入力されたユーザー名を使用
    const username = CURRENT_USERNAME;
    const periodParam = url.searchParams.get("period") || "3";
    let period;
    
    if (periodParam === "all") {
      period = "all";
    } else if (periodParam === "selected") {
      const periodsParam = url.searchParams.get("periods");
      if (!periodsParam) {
        return new Response(JSON.stringify({ error: "Selected periods are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      period = { type: "selected", periods: periodsParam.split(',') };
    } else {
      period = parseInt(periodParam);
    }
    
    if (!username) {
      return new Response(JSON.stringify({ error: "Username not set at server startup" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    try {
      const games = await fetchChessData(username, period);
      const countries = await extractOpponentCountries(games, username);
      
      return new Response(JSON.stringify({
        games: games.length,
        countries: Array.from(countries.entries())
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  
  if (url.pathname === "/api/available-periods") {
    // サーバー起動時に入力されたユーザー名を使用
    const username = CURRENT_USERNAME;
    
    if (!username) {
      return new Response(JSON.stringify({ error: "Username not set at server startup" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    try {
      const availablePeriods = await getAvailablePeriods(username);
      
      return new Response(JSON.stringify({
        username,
        periods: availablePeriods
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  
  if (url.pathname === "/api/all-periods") {
    // サーバー起動時に入力されたユーザー名を使用
    const username = CURRENT_USERNAME;
    
    if (!username) {
      return new Response(JSON.stringify({ error: "Username not set at server startup" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    try {
      const allPeriods = await getAllAvailablePeriods(username);
      const existingPeriods = await getAvailablePeriods(username);
      
      return new Response(JSON.stringify({
        username,
        allPeriods,
        existingPeriods
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  
  if (url.pathname === "/api/current-user") {
    return new Response(JSON.stringify({
      username: CURRENT_USERNAME
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  
  if (url.pathname === "/api/existing-data") {
    try {
      const countries = await loadExistingDataForUser(CURRENT_USERNAME);
      return new Response(JSON.stringify({
        countries: Array.from(countries.entries())
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        countries: [],
        error: error.message 
      }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  
  if (url.pathname === "/api/clear-data") {
    if (req.method === "POST") {
      await storage.clear();
      return new Response(JSON.stringify({ message: "Data cleared" }), {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  
  // 静的ファイルの提供
  if (url.pathname === "/") {
    return serveFile(req, "./index.html");
  }
  
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
  });
}

// コマンドライン入力を読み取る関数
async function promptForUsername(): Promise<string> {
  console.log("Chess.com Map Server");
  console.log("=====================================");
  
  while (true) {
    console.log("\nChess.com のユーザー名を入力してください:");
    
    const decoder = new TextDecoder();
    const buffer = new Uint8Array(1024);
    
    const stdin = Deno.stdin;
    const n = await stdin.read(buffer);
    
    if (n === null) {
      continue;
    }
    
    const input = decoder.decode(buffer.subarray(0, n)).trim();
    
    if (input.length > 0) {
      return input;
    }
    
    console.log("ユーザー名が入力されていません。もう一度入力してください。");
  }
}

// メイン起動関数
async function startServer() {
  // ユーザー名入力（必須）
  const username = await promptForUsername();
  CURRENT_USERNAME = username; // グローバル変数に保存
  
  console.log(`\n入力されたユーザー名: ${username}`);
  
  // 指定されたユーザーのデータ存在確認
  try {
    const userCountries = await loadExistingDataForUser(username);
    if (userCountries.size > 0) {
      const totalGames = Array.from(userCountries.values()).reduce((a, b) => a + b, 0);
      console.log(`\n${username} の既存データ:`);
      console.log(`  対戦国数: ${userCountries.size}カ国`);
      console.log(`  総対戦数: ${totalGames}ゲーム`);
      
      // 上位10カ国のデータを表示
      console.log("\n=== 対戦数上位10カ国 ===");
      const sortedCountries = Array.from(userCountries.entries()).sort((a, b) => b[1] - a[1]);
      sortedCountries.slice(0, 10).forEach(([countryCode, count], index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${countryCode}: ${count}ゲーム`);
      });
      
      if (sortedCountries.length > 10) {
        console.log(`... 他 ${sortedCountries.length - 10}カ国`);
      }
    } else {
      console.log(`\n${username} のデータが見つかりませんでした。`);
      console.log("ブラウザから新規データを取得してください。");
    }
  } catch (error) {
    console.log(`\nデータ読み込みエラー: ${error.message}`);
  }
  
  console.log("\n=====================================");
  console.log("Chess.com Map Server starting on http://localhost:8080");
  console.log("ブラウザで http://localhost:8080 を開いてください。");
  console.log("=====================================\n");
  
  // サーバー起動
  Deno.serve({ port: 8080 }, handler);
}

// サーバー起動
startServer();