import type { InterpreterResult, InterpreterState } from './types'
import { clamp } from './utils'

type TokenType =
  | 'identifier'
  | 'number'
  | 'keyword'
  | 'operator'
  | 'punctuation'
  | 'eof'

interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

interface TypeSpec {
  name: string
  pointerDepth: number
}

interface ProgramNode {
  functions: FunctionNode[]
}

interface FunctionNode {
  returnType: TypeSpec
  name: string
  params: ParameterNode[]
  body: StatementNode[]
}

interface ParameterNode {
  type: TypeSpec
  name: string
}

type StatementNode =
  | BlockStatementNode
  | VariableDeclarationNode
  | ExpressionStatementNode
  | IfStatementNode
  | WhileStatementNode
  | ForStatementNode
  | ReturnStatementNode

interface BlockStatementNode {
  kind: 'block'
  body: StatementNode[]
}

interface VariableDeclarationNode {
  kind: 'var'
  variableType: TypeSpec
  name: string
  arrayLength?: number
  initializer?: ExpressionNode
}

interface ExpressionStatementNode {
  kind: 'expr'
  expression?: ExpressionNode
}

interface IfStatementNode {
  kind: 'if'
  condition: ExpressionNode
  thenBranch: StatementNode
  elseBranch?: StatementNode
}

interface WhileStatementNode {
  kind: 'while'
  condition: ExpressionNode
  body: StatementNode
}

interface ForStatementNode {
  kind: 'for'
  initializer?: StatementNode
  condition?: ExpressionNode
  update?: ExpressionNode
  body: StatementNode
}

interface ReturnStatementNode {
  kind: 'return'
  value?: ExpressionNode
}

type ExpressionNode =
  | LiteralExpressionNode
  | IdentifierExpressionNode
  | AssignmentExpressionNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | CallExpressionNode
  | MemberExpressionNode
  | IndexExpressionNode

interface LiteralExpressionNode {
  kind: 'literal'
  value: number | boolean
}

interface IdentifierExpressionNode {
  kind: 'identifier'
  name: string
}

interface AssignmentExpressionNode {
  kind: 'assign'
  target: ExpressionNode
  value: ExpressionNode
}

interface BinaryExpressionNode {
  kind: 'binary'
  operator: string
  left: ExpressionNode
  right: ExpressionNode
}

interface UnaryExpressionNode {
  kind: 'unary'
  operator: string
  argument: ExpressionNode
}

interface CallExpressionNode {
  kind: 'call'
  callee: string
  args: ExpressionNode[]
}

interface MemberExpressionNode {
  kind: 'member'
  object: ExpressionNode
  property: string
}

interface IndexExpressionNode {
  kind: 'index'
  object: ExpressionNode
  index: ExpressionNode
}

type RuntimeValue = number | boolean | PointerValue | StructValue

interface PointerValue {
  kind: 'pointer'
  address: number
}

interface StructValue {
  kind: 'struct'
  fields: Record<string, RuntimeValue>
}

interface MemoryCell {
  value: RuntimeValue
}

type Binding =
  | { kind: 'variable'; address: number }
  | { kind: 'array'; base: number; length: number }

class InterpreterError extends Error {
  constructor(message: string, readonly line?: number, readonly column?: number) {
    super(message)
    this.name = 'InterpreterError'
  }
}

class ReturnSignal {
  constructor(readonly value: RuntimeValue) {}
}

class Tokenizer {
  private index = 0

  private line = 1

  private column = 1

  private readonly keywords = new Set([
    'int',
    'float',
    'double',
    'bool',
    'if',
    'else',
    'while',
    'for',
    'return',
    'true',
    'false',
  ])

  constructor(private readonly source: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = []
    while (!this.isAtEnd()) {
      this.skipWhitespaceAndComments()
      if (this.isAtEnd()) {
        break
      }

      const startLine = this.line
      const startColumn = this.column
      const char = this.peek()

      if (this.isIdentifierStart(char)) {
        const value = this.consumeWhile((current) => this.isIdentifierPart(current))
        tokens.push({
          type: this.keywords.has(value) ? 'keyword' : 'identifier',
          value,
          line: startLine,
          column: startColumn,
        })
        continue
      }

      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek(1)))) {
        let value = this.consumeWhile((current) => this.isDigit(current) || current === '.')
        if (this.peek().toLowerCase() === 'f') {
          value += this.advance()
        }
        tokens.push({ type: 'number', value, line: startLine, column: startColumn })
        continue
      }

      const twoChar = `${char}${this.peek(1)}`
      if (['<=', '>=', '==', '!=', '&&', '||'].includes(twoChar)) {
        this.advance()
        this.advance()
        tokens.push({ type: 'operator', value: twoChar, line: startLine, column: startColumn })
        continue
      }

      if ('+-*/%=<>!&'.includes(char)) {
        this.advance()
        tokens.push({ type: 'operator', value: char, line: startLine, column: startColumn })
        continue
      }

      if ('(){}[],;.'.includes(char)) {
        this.advance()
        tokens.push({ type: 'punctuation', value: char, line: startLine, column: startColumn })
        continue
      }

      throw new InterpreterError(`未対応の文字です: ${char}`, startLine, startColumn)
    }

    tokens.push({ type: 'eof', value: '', line: this.line, column: this.column })
    return tokens
  }

  private skipWhitespaceAndComments(): void {
    while (!this.isAtEnd()) {
      const char = this.peek()
      const next = this.peek(1)
      if (char === '/' && next === '/') {
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance()
        }
        continue
      }
      if (/\s/.test(char)) {
        this.advance()
        continue
      }
      break
    }
  }

  private consumeWhile(predicate: (char: string) => boolean): string {
    let output = ''
    while (!this.isAtEnd() && predicate(this.peek())) {
      output += this.advance()
    }
    return output
  }

  private isIdentifierStart(char: string): boolean {
    return /[A-Za-z_]/.test(char)
  }

  private isIdentifierPart(char: string): boolean {
    return /[A-Za-z0-9_]/.test(char)
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char)
  }

  private peek(offset = 0): string {
    return this.source[this.index + offset] ?? '\0'
  }

  private advance(): string {
    const char = this.source[this.index] ?? '\0'
    this.index += 1
    if (char === '\n') {
      this.line += 1
      this.column = 1
    } else {
      this.column += 1
    }
    return char
  }

  private isAtEnd(): boolean {
    return this.index >= this.source.length
  }
}

class Parser {
  private index = 0

  constructor(private readonly tokens: Token[]) {}

  parseProgram(): ProgramNode {
    const functions: FunctionNode[] = []
    while (!this.check('eof')) {
      functions.push(this.parseFunction())
    }
    return { functions }
  }

  private parseFunction(): FunctionNode {
    const returnType = this.parseType()
    const name = this.consumeIdentifier('関数名が必要です').value
    this.consume('punctuation', '(', '関数定義の ( が必要です')

    const params: ParameterNode[] = []
    if (!this.check('punctuation', ')')) {
      do {
        const type = this.parseType()
        const paramName = this.consumeIdentifier('引数名が必要です').value
        params.push({ type, name: paramName })
      } while (this.match('punctuation', ','))
    }

    this.consume('punctuation', ')', '関数定義の ) が必要です')
    const body = this.parseBlockStatement().body
    return { returnType, name, params, body }
  }

  private parseStatement(): StatementNode {
    if (this.match('punctuation', '{')) {
      this.index -= 1
      return this.parseBlockStatement()
    }
    if (this.match('keyword', 'if')) {
      return this.parseIfStatement()
    }
    if (this.match('keyword', 'while')) {
      return this.parseWhileStatement()
    }
    if (this.match('keyword', 'for')) {
      return this.parseForStatement()
    }
    if (this.match('keyword', 'return')) {
      return this.parseReturnStatement()
    }
    if (this.isTypeStart()) {
      return this.parseVariableDeclaration(true)
    }
    return this.parseExpressionStatement()
  }

  private parseBlockStatement(): BlockStatementNode {
    this.consume('punctuation', '{', '{ が必要です')
    const body: StatementNode[] = []
    while (!this.check('punctuation', '}') && !this.check('eof')) {
      body.push(this.parseStatement())
    }
    this.consume('punctuation', '}', '} が必要です')
    return { kind: 'block', body }
  }

  private parseVariableDeclaration(requireSemicolon: boolean): VariableDeclarationNode {
    const variableType = this.parseType()
    const name = this.consumeIdentifier('変数名が必要です').value
    let arrayLength: number | undefined
    if (this.match('punctuation', '[')) {
      const sizeToken = this.consume('number', undefined, '配列サイズが必要です')
      arrayLength = Number.parseInt(sizeToken.value, 10)
      this.consume('punctuation', ']', '] が必要です')
    }

    let initializer: ExpressionNode | undefined
    if (this.match('operator', '=')) {
      initializer = this.parseExpression()
    }
    if (requireSemicolon) {
      this.consume('punctuation', ';', '; が必要です')
    }
    return { kind: 'var', variableType, name, arrayLength, initializer }
  }

  private parseIfStatement(): IfStatementNode {
    this.consume('punctuation', '(', 'if の条件式は () で囲んでください')
    const condition = this.parseExpression()
    this.consume('punctuation', ')', 'if の条件式を閉じてください')
    const thenBranch = this.parseStatement()
    const elseBranch = this.match('keyword', 'else') ? this.parseStatement() : undefined
    return { kind: 'if', condition, thenBranch, elseBranch }
  }

  private parseWhileStatement(): WhileStatementNode {
    this.consume('punctuation', '(', 'while の条件式は () で囲んでください')
    const condition = this.parseExpression()
    this.consume('punctuation', ')', 'while の条件式を閉じてください')
    return { kind: 'while', condition, body: this.parseStatement() }
  }

  private parseForStatement(): ForStatementNode {
    this.consume('punctuation', '(', 'for の条件式は () で囲んでください')

    let initializer: StatementNode | undefined
    if (!this.check('punctuation', ';')) {
      initializer = this.isTypeStart()
        ? this.parseVariableDeclaration(false)
        : { kind: 'expr', expression: this.parseExpression() }
    }
    this.consume('punctuation', ';', 'for の初期化部の後に ; が必要です')

    const condition = this.check('punctuation', ';') ? undefined : this.parseExpression()
    this.consume('punctuation', ';', 'for の条件部の後に ; が必要です')

    const update = this.check('punctuation', ')') ? undefined : this.parseExpression()
    this.consume('punctuation', ')', 'for の更新部を閉じてください')

    return {
      kind: 'for',
      initializer,
      condition,
      update,
      body: this.parseStatement(),
    }
  }

  private parseReturnStatement(): ReturnStatementNode {
    const value = this.check('punctuation', ';') ? undefined : this.parseExpression()
    this.consume('punctuation', ';', 'return の後に ; が必要です')
    return { kind: 'return', value }
  }

  private parseExpressionStatement(): ExpressionStatementNode {
    if (this.match('punctuation', ';')) {
      return { kind: 'expr' }
    }
    const expression = this.parseExpression()
    this.consume('punctuation', ';', '式の後に ; が必要です')
    return { kind: 'expr', expression }
  }

  private parseExpression(): ExpressionNode {
    return this.parseAssignment()
  }

  private parseAssignment(): ExpressionNode {
    const left = this.parseLogicalOr()
    if (this.match('operator', '=')) {
      const value = this.parseAssignment()
      return { kind: 'assign', target: left, value }
    }
    return left
  }

  private parseLogicalOr(): ExpressionNode {
    let expr = this.parseLogicalAnd()
    while (this.match('operator', '||')) {
      expr = { kind: 'binary', operator: '||', left: expr, right: this.parseLogicalAnd() }
    }
    return expr
  }

  private parseLogicalAnd(): ExpressionNode {
    let expr = this.parseEquality()
    while (this.match('operator', '&&')) {
      expr = { kind: 'binary', operator: '&&', left: expr, right: this.parseEquality() }
    }
    return expr
  }

  private parseEquality(): ExpressionNode {
    let expr = this.parseComparison()
    while (this.match('operator', '==') || this.match('operator', '!=')) {
      const operator = this.previous().value
      expr = { kind: 'binary', operator, left: expr, right: this.parseComparison() }
    }
    return expr
  }

  private parseComparison(): ExpressionNode {
    let expr = this.parseTerm()
    while (
      this.match('operator', '<') ||
      this.match('operator', '<=') ||
      this.match('operator', '>') ||
      this.match('operator', '>=')
    ) {
      const operator = this.previous().value
      expr = { kind: 'binary', operator, left: expr, right: this.parseTerm() }
    }
    return expr
  }

  private parseTerm(): ExpressionNode {
    let expr = this.parseFactor()
    while (this.match('operator', '+') || this.match('operator', '-')) {
      const operator = this.previous().value
      expr = { kind: 'binary', operator, left: expr, right: this.parseFactor() }
    }
    return expr
  }

  private parseFactor(): ExpressionNode {
    let expr = this.parseUnary()
    while (this.match('operator', '*') || this.match('operator', '/') || this.match('operator', '%')) {
      const operator = this.previous().value
      expr = { kind: 'binary', operator, left: expr, right: this.parseUnary() }
    }
    return expr
  }

  private parseUnary(): ExpressionNode {
    if (
      this.match('operator', '-') ||
      this.match('operator', '!') ||
      this.match('operator', '*') ||
      this.match('operator', '&') ||
      this.match('operator', '+')
    ) {
      return { kind: 'unary', operator: this.previous().value, argument: this.parseUnary() }
    }
    return this.parsePostfix()
  }

  private parsePostfix(): ExpressionNode {
    let expr = this.parsePrimary()
    while (true) {
      if (this.match('punctuation', '(')) {
        const args: ExpressionNode[] = []
        if (!this.check('punctuation', ')')) {
          do {
            args.push(this.parseExpression())
          } while (this.match('punctuation', ','))
        }
        this.consume('punctuation', ')', '関数呼び出しを閉じてください')
        if (expr.kind !== 'identifier') {
          throw new InterpreterError('関数名は識別子である必要があります')
        }
        expr = { kind: 'call', callee: expr.name, args }
        continue
      }

      if (this.match('punctuation', '.')) {
        const property = this.consumeIdentifier('メンバ名が必要です').value
        expr = { kind: 'member', object: expr, property }
        continue
      }

      if (this.match('punctuation', '[')) {
        const index = this.parseExpression()
        this.consume('punctuation', ']', '配列アクセスを閉じてください')
        expr = { kind: 'index', object: expr, index }
        continue
      }
      break
    }
    return expr
  }

  private parsePrimary(): ExpressionNode {
    if (this.match('number')) {
      return { kind: 'literal', value: Number.parseFloat(this.previous().value.replace(/[fF]$/, '')) }
    }
    if (this.match('keyword', 'true')) {
      return { kind: 'literal', value: true }
    }
    if (this.match('keyword', 'false')) {
      return { kind: 'literal', value: false }
    }
    if (this.match('identifier')) {
      return { kind: 'identifier', name: this.previous().value }
    }
    if (this.match('punctuation', '(')) {
      const expr = this.parseExpression()
      this.consume('punctuation', ')', ') が必要です')
      return expr
    }
    throw this.error(this.peek(), '式が必要です')
  }

  private parseType(): TypeSpec {
    const token = this.peek()
    if (token.type !== 'keyword' && token.type !== 'identifier') {
      throw this.error(token, '型名が必要です')
    }
    this.advance()
    let pointerDepth = 0
    while (this.match('operator', '*')) {
      pointerDepth += 1
    }
    return { name: token.value, pointerDepth }
  }

  private isTypeStart(): boolean {
    const token = this.peek()
    if (token.type === 'keyword') {
      return ['int', 'float', 'double', 'bool'].includes(token.value)
    }
    return token.type === 'identifier'
  }

  private consumeIdentifier(message: string): Token {
    const token = this.peek()
    if (token.type === 'identifier') {
      return this.advance()
    }
    throw this.error(token, message)
  }

  private consume(type: TokenType, value?: string, message?: string): Token {
    const token = this.peek()
    if (token.type === type && (value === undefined || token.value === value)) {
      return this.advance()
    }
    throw this.error(token, message ?? `${value ?? type} が必要です`)
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.peek()
    if (token.type !== type) {
      return false
    }
    if (value !== undefined && token.value !== value) {
      return false
    }
    this.advance()
    return true
  }

  private check(type: TokenType, value?: string): boolean {
    const token = this.peek()
    return token.type === type && (value === undefined || token.value === value)
  }

  private peek(): Token {
    return this.tokens[this.index] ?? this.tokens[this.tokens.length - 1]
  }

  private previous(): Token {
    return this.tokens[this.index - 1]
  }

  private advance(): Token {
    const token = this.peek()
    this.index += 1
    return token
  }

  private error(token: Token, message: string): InterpreterError {
    return new InterpreterError(message, token.line, token.column)
  }
}

class Runtime {
  private memory = new Map<number, MemoryCell>()

  private nextAddress = 1

  private steps = 0

  private readonly functions = new Map<string, FunctionNode>()

  constructor(
    program: ProgramNode,
    private readonly maxSteps: number,
  ) {
    for (const fn of program.functions) {
      this.functions.set(fn.name, fn)
    }
  }

  executeControl(state: InterpreterState): InterpreterResult {
    const controlFunction = this.functions.get('control')
    if (!controlFunction) {
      return { ok: false, error: '`control` 関数が見つかりません', steps: this.steps }
    }

    try {
      const struct = this.createStateStruct(state)
      const result = this.invokeFunction(controlFunction, [struct])
      return {
        ok: true,
        value: clamp(this.toNumber(result), -1, 1),
        steps: this.steps,
      }
    } catch (error) {
      const message =
        error instanceof InterpreterError
          ? error.line !== undefined && error.column !== undefined
            ? `${error.message} (${error.line}:${error.column})`
            : error.message
          : '実行に失敗しました'
      return { ok: false, error: message, steps: this.steps }
    }
  }

  private createStateStruct(state: InterpreterState): StructValue {
    return {
      kind: 'struct',
      fields: {
        position: state.position,
        velocity: state.velocity,
        acceleration: state.acceleration,
        target: state.target,
        time: state.time,
        error: state.error,
        integral: state.integral,
      },
    }
  }

  private invokeFunction(fn: FunctionNode, args: RuntimeValue[]): RuntimeValue {
    this.tick()
    const scope = new Map<string, Binding>()
    fn.params.forEach((param, index) => {
      const address = this.allocate(args[index] ?? 0)
      scope.set(param.name, { kind: 'variable', address })
    })

    try {
      this.executeBlock(fn.body, [scope])
    } catch (signal) {
      if (signal instanceof ReturnSignal) {
        return signal.value
      }
      throw signal
    }
    return 0
  }

  private executeBlock(statements: StatementNode[], scopes: Map<string, Binding>[]): void {
    const localScopes = [...scopes, new Map<string, Binding>()]
    for (const statement of statements) {
      this.executeStatement(statement, localScopes)
    }
  }

  private executeStatement(statement: StatementNode, scopes: Map<string, Binding>[]): void {
    this.tick()
    switch (statement.kind) {
      case 'block':
        this.executeBlock(statement.body, scopes)
        return
      case 'var':
        this.declareVariable(statement, scopes)
        return
      case 'expr':
        if (statement.expression) {
          this.evaluateExpression(statement.expression, scopes)
        }
        return
      case 'if':
        if (this.isTruthy(this.evaluateExpression(statement.condition, scopes))) {
          this.executeStatement(statement.thenBranch, scopes)
        } else if (statement.elseBranch) {
          this.executeStatement(statement.elseBranch, scopes)
        }
        return
      case 'while':
        while (this.isTruthy(this.evaluateExpression(statement.condition, scopes))) {
          this.tick()
          this.executeStatement(statement.body, scopes)
        }
        return
      case 'for': {
        const loopScopes = [...scopes, new Map<string, Binding>()]
        if (statement.initializer) {
          this.executeStatement(statement.initializer, loopScopes)
        }
        while (statement.condition ? this.isTruthy(this.evaluateExpression(statement.condition, loopScopes)) : true) {
          this.tick()
          this.executeStatement(statement.body, loopScopes)
          if (statement.update) {
            this.evaluateExpression(statement.update, loopScopes)
          }
        }
        return
      }
      case 'return':
        throw new ReturnSignal(statement.value ? this.evaluateExpression(statement.value, scopes) : 0)
      default:
        throw new InterpreterError('未対応の文です')
    }
  }

  private declareVariable(statement: VariableDeclarationNode, scopes: Map<string, Binding>[]): void {
    const currentScope = scopes[scopes.length - 1]
    if (statement.arrayLength !== undefined) {
      const length = Math.max(1, statement.arrayLength)
      const base = this.allocateArray(length)
      currentScope.set(statement.name, { kind: 'array', base, length })
      if (statement.initializer) {
        throw new InterpreterError('配列の初期化子はまだ未対応です')
      }
      return
    }

    const initialValue = statement.initializer ? this.evaluateExpression(statement.initializer, scopes) : 0
    const address = this.allocate(initialValue)
    currentScope.set(statement.name, { kind: 'variable', address })
  }

  private evaluateExpression(expression: ExpressionNode, scopes: Map<string, Binding>[]): RuntimeValue {
    this.tick()
    switch (expression.kind) {
      case 'literal':
        return expression.value
      case 'identifier':
        return this.readIdentifier(expression.name, scopes)
      case 'assign': {
        const value = this.evaluateExpression(expression.value, scopes)
        this.assign(expression.target, value, scopes)
        return value
      }
      case 'binary':
        return this.evaluateBinary(expression, scopes)
      case 'unary':
        return this.evaluateUnary(expression, scopes)
      case 'call': {
        const fn = this.functions.get(expression.callee)
        if (!fn) {
          throw new InterpreterError(`未定義の関数です: ${expression.callee}`)
        }
        const args = expression.args.map((arg) => this.evaluateExpression(arg, scopes))
        return this.invokeFunction(fn, args)
      }
      case 'member': {
        const object = this.evaluateExpression(expression.object, scopes)
        if (!this.isStruct(object)) {
          throw new InterpreterError('メンバアクセスの対象が構造体ではありません')
        }
        if (!(expression.property in object.fields)) {
          throw new InterpreterError(`未定義のメンバです: ${expression.property}`)
        }
        return object.fields[expression.property]
      }
      case 'index': {
        const ref = this.resolveIndexedAddress(expression, scopes)
        return this.readMemory(ref)
      }
      default:
        throw new InterpreterError('未対応の式です')
    }
  }

  private evaluateBinary(expression: BinaryExpressionNode, scopes: Map<string, Binding>[]): RuntimeValue {
    if (expression.operator === '&&') {
      return this.isTruthy(this.evaluateExpression(expression.left, scopes))
        ? this.isTruthy(this.evaluateExpression(expression.right, scopes))
        : false
    }
    if (expression.operator === '||') {
      return this.isTruthy(this.evaluateExpression(expression.left, scopes))
        ? true
        : this.isTruthy(this.evaluateExpression(expression.right, scopes))
    }

    const left = this.evaluateExpression(expression.left, scopes)
    const right = this.evaluateExpression(expression.right, scopes)

    if (this.isPointer(left) && ['+', '-'].includes(expression.operator) && typeof right === 'number') {
      return { kind: 'pointer', address: left.address + (expression.operator === '+' ? right : -right) }
    }

    const lhs = this.toNumber(left)
    const rhs = this.toNumber(right)
    switch (expression.operator) {
      case '+':
        return lhs + rhs
      case '-':
        return lhs - rhs
      case '*':
        return lhs * rhs
      case '/':
        if (rhs === 0) {
          throw new InterpreterError('0 で割ることはできません')
        }
        return lhs / rhs
      case '%':
        return lhs % rhs
      case '<':
        return lhs < rhs
      case '<=':
        return lhs <= rhs
      case '>':
        return lhs > rhs
      case '>=':
        return lhs >= rhs
      case '==':
        return lhs === rhs
      case '!=':
        return lhs !== rhs
      default:
        throw new InterpreterError(`未対応の演算子です: ${expression.operator}`)
    }
  }

  private evaluateUnary(expression: UnaryExpressionNode, scopes: Map<string, Binding>[]): RuntimeValue {
    switch (expression.operator) {
      case '-':
        return -this.toNumber(this.evaluateExpression(expression.argument, scopes))
      case '+':
        return this.toNumber(this.evaluateExpression(expression.argument, scopes))
      case '!':
        return !this.isTruthy(this.evaluateExpression(expression.argument, scopes))
      case '&':
        return { kind: 'pointer', address: this.resolveAddress(expression.argument, scopes) }
      case '*': {
        const pointer = this.evaluateExpression(expression.argument, scopes)
        if (!this.isPointer(pointer)) {
          throw new InterpreterError('ポインタでない値を参照外しできません')
        }
        return this.readMemory(pointer.address)
      }
      default:
        throw new InterpreterError(`未対応の単項演算子です: ${expression.operator}`)
    }
  }

  private assign(target: ExpressionNode, value: RuntimeValue, scopes: Map<string, Binding>[]): void {
    if (target.kind === 'identifier') {
      const binding = this.lookupBinding(target.name, scopes)
      if (binding.kind !== 'variable') {
        throw new InterpreterError('配列全体への代入はできません')
      }
      this.writeMemory(binding.address, value)
      return
    }

    if (target.kind === 'member') {
      const object = this.evaluateExpression(target.object, scopes)
      if (!this.isStruct(object)) {
        throw new InterpreterError('構造体でない値にはメンバ代入できません')
      }
      object.fields[target.property] = value
      return
    }

    if (target.kind === 'index') {
      const address = this.resolveIndexedAddress(target, scopes)
      this.writeMemory(address, value)
      return
    }

    if (target.kind === 'unary' && target.operator === '*') {
      const pointer = this.evaluateExpression(target.argument, scopes)
      if (!this.isPointer(pointer)) {
        throw new InterpreterError('ポインタでない値を参照外し代入できません')
      }
      this.writeMemory(pointer.address, value)
      return
    }

    throw new InterpreterError('代入できない式です')
  }

  private resolveAddress(expression: ExpressionNode, scopes: Map<string, Binding>[]): number {
    if (expression.kind === 'identifier') {
      const binding = this.lookupBinding(expression.name, scopes)
      return binding.kind === 'variable' ? binding.address : binding.base
    }
    if (expression.kind === 'index') {
      return this.resolveIndexedAddress(expression, scopes)
    }
    throw new InterpreterError('アドレスを取得できない式です')
  }

  private resolveIndexedAddress(expression: IndexExpressionNode, scopes: Map<string, Binding>[]): number {
    const indexValue = Math.trunc(this.toNumber(this.evaluateExpression(expression.index, scopes)))
    if (expression.object.kind === 'identifier') {
      const binding = this.lookupBinding(expression.object.name, scopes)
      if (binding.kind === 'array') {
        if (indexValue < 0 || indexValue >= binding.length) {
          throw new InterpreterError('配列の範囲外アクセスです')
        }
        return binding.base + indexValue
      }
      if (binding.kind === 'variable') {
        const pointer = this.readMemory(binding.address)
        if (!this.isPointer(pointer)) {
          throw new InterpreterError('配列アクセスの対象がポインタではありません')
        }
        return pointer.address + indexValue
      }
    }

    const base = this.evaluateExpression(expression.object, scopes)
    if (!this.isPointer(base)) {
      throw new InterpreterError('配列アクセスの対象がポインタではありません')
    }
    return base.address + indexValue
  }

  private readIdentifier(name: string, scopes: Map<string, Binding>[]): RuntimeValue {
    const binding = this.lookupBinding(name, scopes)
    if (binding.kind === 'array') {
      return { kind: 'pointer', address: binding.base }
    }
    return this.readMemory(binding.address)
  }

  private lookupBinding(name: string, scopes: Map<string, Binding>[]): Binding {
    for (let index = scopes.length - 1; index >= 0; index -= 1) {
      const binding = scopes[index]?.get(name)
      if (binding) {
        return binding
      }
    }
    throw new InterpreterError(`未定義の識別子です: ${name}`)
  }

  private allocate(value: RuntimeValue): number {
    const address = this.nextAddress
    this.nextAddress += 1
    this.memory.set(address, { value })
    return address
  }

  private allocateArray(length: number): number {
    const base = this.nextAddress
    for (let index = 0; index < length; index += 1) {
      this.allocate(0)
    }
    return base
  }

  private readMemory(address: number): RuntimeValue {
    const cell = this.memory.get(address)
    if (!cell) {
      throw new InterpreterError('不正なメモリアクセスです')
    }
    return cell.value
  }

  private writeMemory(address: number, value: RuntimeValue): void {
    if (!this.memory.has(address)) {
      throw new InterpreterError('不正なメモリアクセスです')
    }
    this.memory.set(address, { value })
  }

  private tick(): void {
    this.steps += 1
    if (this.steps > this.maxSteps) {
      throw new InterpreterError('実行ステップ数の上限を超えました。無限ループの可能性があります。')
    }
  }

  private isTruthy(value: RuntimeValue): boolean {
    if (typeof value === 'boolean') {
      return value
    }
    if (this.isPointer(value)) {
      return value.address !== 0
    }
    return this.toNumber(value) !== 0
  }

  private toNumber(value: RuntimeValue): number {
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0
    }
    if (this.isPointer(value)) {
      return value.address
    }
    throw new InterpreterError('構造体は数値として扱えません')
  }

  private isPointer(value: RuntimeValue): value is PointerValue {
    return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'pointer'
  }

  private isStruct(value: RuntimeValue): value is StructValue {
    return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'struct'
  }
}

function normalizeSource(source: string): string {
  const lines = source.split('\n')
  const includeLines = lines.filter((line) => line.trim().startsWith('#include'))
  if (includeLines.length === 0) {
    throw new InterpreterError('`#include <control.hpp>` を先頭に書いてください')
  }

  for (const line of includeLines) {
    if (line.trim() !== '#include <control.hpp>') {
      throw new InterpreterError('使用できる include は `<control.hpp>` のみです')
    }
  }

  return lines.filter((line) => !line.trim().startsWith('#include')).join('\n')
}

export class CppSubsetInterpreter {
  constructor(private readonly maxSteps = 4000) {}

  run(source: string, state: InterpreterState): InterpreterResult {
    try {
      const normalized = normalizeSource(source)
      const tokens = new Tokenizer(normalized).tokenize()
      const program = new Parser(tokens).parseProgram()
      return new Runtime(program, this.maxSteps).executeControl(state)
    } catch (error) {
      if (error instanceof InterpreterError) {
        return {
          ok: false,
          error:
            error.line !== undefined && error.column !== undefined
              ? `${error.message} (${error.line}:${error.column})`
              : error.message,
          steps: 0,
        }
      }
      return { ok: false, error: 'インタプリタの初期化に失敗しました', steps: 0 }
    }
  }
}

export const DEFAULT_CPP_TEMPLATE = `#include <control.hpp>

float control(State state) {
    float error = state.target - state.position;
    if (error > 0.1f) {
        return 1.0f;
    }
    if (error < -0.1f) {
        return -1.0f;
    }
    return 0.0f;
}
`
