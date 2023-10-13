"""
This example uses LexRank (https://www.aaai.org/Papers/JAIR/Vol22/JAIR-2214.pdf)
to create an extractive summarization of a long document.

The document is splitted into sentences using NLTK, then the sentence embeddings are computed. We
then compute the cosine-similarity across all possible sentence pairs.

We then use LexRank to find the most central sentences in the document, which form our summary.

Input document: First section from the English Wikipedia Section
Output summary:
Located at the southern tip of the U.S. state of New York, the city is the center of the New York metropolitan area, the largest metropolitan area in the world by urban landmass.
New York City (NYC), often called simply New York, is the most populous city in the United States.
Anchored by Wall Street in the Financial District of Lower Manhattan, New York City has been called both the world's leading financial center and the most financially powerful city in the world, and is home to the world's two largest stock exchanges by total market capitalization, the New York Stock Exchange and NASDAQ.
New York City has been described as the cultural, financial, and media capital of the world, significantly influencing commerce, entertainment, research, technology, education, politics, tourism, art, fashion, and sports.
If the New York metropolitan area were a sovereign state, it would have the eighth-largest economy in the world.
"""
import nltk
from sentence_transformers import SentenceTransformer, util
import numpy as np
from LexRank import degree_centrality_scores

nltk.download('punkt')

model = SentenceTransformer('all-MiniLM-L6-v2')

# Our input document we want to summarize
# As example, we take the first section from Wikipedia
document = """
Near a great forest there lived a poor woodcutter and his wife, and his two children; the boy's name was Hansel and the girl's Grethel. They had very little to bite or to sup, and once, when there was great dearth in the land, the man could not even gain the daily bread. As he lay in bed one night thinking of this, and turning and tossing, he sighed heavily, and said to his wife, "What will become of us? we cannot even feed our children; there is nothing left for ourselves."
"I will tell you what, husband," answered the wife; "we will take the children early in the morning into the forest, where it is thickest; we will make them a fire, and we will give each of them a piece of bread, then we will go to our work and leave them alone; they will never find the way home again, and we shall be quit of them."
"No, wife," said the man, "I cannot do that; I cannot find in my heart to take my children into the forest and to leave them there alone; the wild animals would soon come and devour them." - "O you fool," said she, "then we will all four starve; you had better get the coffins ready," and she left him no peace until he consented. "But I really pity the poor children," said the man.
The two children had not been able to sleep for hunger, and had heard what their step-mother had said to their father. Grethel wept bitterly, and said to Hansel, "It is all over with us."
"Do be quiet, Grethel," said Hansel, "and do not fret; 1 will manage something." And when the parents had gone to sleep he got up, put on his little coat, opened the back door, and slipped out. The moon was shining brightly, and the white flints that lay in front of the house glistened like pieces of silver. Hansel stooped and filled the little pocket of his coat as full as it would hold. Then he went back again, and said to Grethel, "Be easy, dear little sister, and go to sleep quietly; God will not forsake us," and laid himself down again in his bed. When the day was breaking, and before the sun had risen, the wife came and awakened the two children, saying, "Get up, you lazy bones; we are going into the forest to cut wood." Then she gave each of them a piece of bread, and said, "That is for dinner, and you must not eat it before then, for you will get no more." Grethel carried the bread under her apron, for Hansel had his pockets full of the flints. Then they set off all together on their way to the forest. When they had gone a little way Hansel stood still and looked back towards the house, and this he did again and again, till his father said to him, "Hansel, what are you looking at? take care not to forget your legs."
"O father," said Hansel, "lam looking at my little white kitten, who is sitting up on the roof to bid me good-bye." - "You young fool," said the woman, "that is not your kitten, but the sunshine on the chimney-pot." Of course Hansel had not been looking at his kitten, but had been taking every now and then a flint from his pocket and dropping it on the road. When they reached the middle of the forest the father told the children to collect wood to make a fire to keep them, warm; and Hansel and Grethel gathered brushwood enough for a little mountain j and it was set on fire, and when the flame was burning quite high the wife said, "Now lie down by the fire and rest yourselves, you children, and we will go and cut wood; and when we are ready we will come and fetch you."
So Hansel and Grethel sat by the fire, and at noon they each ate their pieces of bread. They thought their father was in the wood all the time, as they seemed to hear the strokes of the axe: but really it was only a dry branch hanging to a withered tree that the wind moved to and fro. So when they had stayed there a long time their eyelids closed with weariness, and they fell fast asleep.
When at last they woke it was night, and Grethel began to cry, and said, "How shall we ever get out of this wood? "But Hansel comforted her, saying, "Wait a little while longer, until the moon rises, and then we can easily find the way home." And when the full moon got up Hansel took his little sister by the hand, and followed the way where the flint stones shone like silver, and showed them the road. They walked on the whole night through, and at the break of day they came to their father's house. They knocked at the door, and when the wife opened it and saw that it was Hansel and Grethel she said, "You naughty children, why did you sleep so long in the wood? we thought you were never coming home again!" But the father was glad, for it had gone to his heart to leave them both in the woods alone.
Not very long after that there was again great scarcity in those parts, and the children heard their mother say at night in bed to their father, "Everything is finished up; we have only half a loaf, and after that the tale comes to an end. The children must be off; we will take them farther into the wood this time, so that they shall not be able to find the way back again; there is no other way to manage." The man felt sad at heart, and he thought, "It would better to share one's last morsel with one's children." But the wife would listen to nothing that he said, but scolded and reproached him. He who says A must say B too, and when a man has given in once he has to do it a second time.
But the children were not asleep, and had heard all the talk. When the parents had gone to sleep Hansel got up to go out and get more flint stones, as he did before, but the wife had locked the door, and Hansel could not get out; but he comforted his little sister, and said, "Don't cry, Grethel, and go to sleep quietly, and God will help us." Early the next morning the wife came and pulled the children out of bed. She gave them each a little piece of "bread -less than before; and on the way to the wood Hansel crumbled the bread in his pocket, and often stopped to throw a crumb on the ground. "Hansel, what are you stopping behind and staring for?" said the father.
"I am looking at my little pigeon sitting on the roof, to say good-bye to me," answered Hansel. "You fool," said the wife, "that is no pigeon, but the morning sun shining on the chimney pots." Hansel went on as before, and strewed bread crumbs all along the road. The woman led the children far into the wood, where they had never been before in all their lives. And again there was a large fire made, and the mother said, "Sit still there, you children, and when you are tired you can go to sleep; we are going into the forest to cut wood, and in the evening, when we are ready to go home we will come and fetch you."
So when noon came Grethel shared her bread with Hansel, who had strewed his along the road. Then they went to sleep, and the evening passed, and no one came for the poor children. When they awoke it was dark night, and Hansel comforted his little sister, and said, "Wait a little, Grethel, until the moon gets up, then we shall be able to see the way home by the crumbs of bread that I have scattered along it."
So when the moon rose they got up, but they could find no crumbs of bread, for the birds of the woods and of the fields had come and picked them up. Hansel thought they might find the way all the same, but they could not. They went on all that night, and the next day from the morning until the evening, but they could not find the way out of the wood, and they were very hungry, for they had nothing to eat but the few berries they could pick up. And when they were so tired that they could no longer drag themselves along, they lay down under a tree and fell asleep.
It was now the third morning since they had left their father's house. They were always trying to get back to it, but instead of that they only found themselves farther in the wood, and if help had not soon come they would have been starved.
About noon they saw a pretty snow-white bird sitting on a bough, and singing so sweetly that they stopped to listen. And when he had finished the bird spread his wings and flew before them, and they followed after him until they came to a little house, and the bird perched on the roof, and when they came nearer they saw that the house was built of bread, and roofed with cakes; and the window was of transparent sugar. "We will have some of this," said Hansel, "and make a fine meal. I will eat a piece of the roof, Grethel, and you can have some of the window-that will taste sweet." So Hansel reached up and broke off a bit of the roof, just to see how it tasted, and Grethel stood by the window and gnawed at it. Then they heard a thin voice call out from inside,
"Nibble, nibble, like a mouse, Who is nibbling at my house?" And the children answered,
"Never mind, It is the wind."
And they went on eating, never disturbing themselves. Hansel, who found that the roof tasted very nice, took down a great piece of it, and Grethel pulled out a large round window-pane, and sat her down and began upon it.
Then the door opened, and an aged woman came out, leaning upon a crutch. Hansel and Grethel felt very frightened, and let fall what they had in their hands. The old woman, however, nodded her head, and said, "Ah, my dear children, how come you here? you must come indoors and stay with me, you will be no trouble." So she took them each by the hand, and led them into her little house. And there they found a good meal laid out, of milk and pancakes, with sugar, apples, and nuts. After that she showed them two little white beds, and Hansel and Grethel laid themselves down on them, and thought they were in heaven.
The old woman, although her behaviour was so kind, was a wicked witch, who lay in wait for children, and had built the little house on purpose to entice them. When they were once inside she used to kill them, cook them, and eat them, and then it was a feast day with her. The witch's eyes were red, and she could not see very far, but she had a keen scent, like the beasts, and knew very well when human creatures were near. When she knew that Hansel and Grethel were coming, she gave a spiteful laugh, and said triumphantly, "I have them, and they shall not escape me!"
Early in the morning, before the children were awake, she got up to look at them, and as they lay sleeping so peacefully with round rosy cheeks, she said to herself, "What a fine feast I shall have!" Then she grasped Hansel with her withered hand, and led him into a little stable, and shut him up behind a grating; and call and scream as he might, it was no good. Then she went back to Grethel and shook her, crying, "Get up, lazy bones; fetch water, and cook something nice for your brother; he is outside in the stable, and must be fattened up. And when he is fat enough I will eat him." Grethel began to weep bitterly, but it was of no use, she had to do what the wicked witch bade her. And so the best kind of victuals was cooked for poor Hansel, while Grethel got nothing but crab-shells.
Each morning the old woman visited the little stable, and cried, "Hansel, stretch out your finger, that I may tell if you will soon be fat enough." Hansel, however, used to hold out a little bone, and the old woman, who had weak eyes, could not see what it was, and supposing it to be Hansel's finger, wondered very much that it was not getting fatter.
When four weeks had passed and Hansel seemed to remain so thin, she lost patience and could wait no longer. "Now then, Grethel," cried she to the little girl; "be quick and draw water; be Hansel fat or be he lean, tomorrow I must kill and cook him." Oh what a grief for the poor little sister to have to fetch water, and how the tears flowed down over her cheeks! "Dear God, pray help us!" cried she; "if we had been devoured by wild beasts in the wood at least we should have died together."
"Spare me your lamentations," said the old woman; "they are of no avail." Early next morning Grethel had to get up, make the fire, and fill the kettle. "First we will do the baking," said the old woman; "I nave heated the oven already, and kneaded the dough." She pushed poor Grethel towards the oven, out of which the flames were already shining.
"Creep in," said the witch, "and see if it is properly hot, so that the bread may be baked." And Grethel once in, she meant to shut the door upon her and let her be baked, and then she would have eaten her. But Grethel perceived her intention, and said, "I don't know how to do it: how shall I get in?"
"Stupid goose," said the old woman, "the opening is big enough, do you see? I could get in myself!" and she stooped down and put her head in the oven's mouth. Then Grethel gave her a push, so that she went in farther, and she shut the iron door upon her, and put up the bar. Oh how frightfully she howled! but Grethel ran away, and left the wicked witch to burn miserably.
Grethel went straight to Hansel, opened the stable-door, and cried, "Hansel, we are free! the old witch is dead!" Then out flew Hansel like a bird from its cage as soon as the door is opened. How rejoiced they both were! how they fell each on the other's neck! and danced about, and kissed each other! And as they had nothing more to fear they went over all the old witch's house, and in every corner there stood chests of pearls and precious stones. "This is something better than flint stones," said Hansel, as he filled his pockets, and Grethel, thinking she also would like to carry something home with her, filled her apron full. i! Now, away we go," said Hansel, "if we only can get out of the witch's wood." When they had journeyed a few hours they came to a great piece of water. "We can never get across this," said Hansel, "I see no stepping-stones and no bridge."
"And there is no boat either," said Grethel; "but here comes a white duck; if I ask her she will help us over." So she cried,
"Duck, duck, here we stand, Hansel and Grethel, on the land, Stepping-stones and bridge we lack, Carry us over on your nice white back."
And the duck came accordingly, and Hansel got upon her and told his sister to come too. "No," answered Grethel, "that would be too hard upon the duck; we can go separately, one after the other." And that was how it was managed, and after that they went on happily, until they came to the wood, and the way grew more and more familiar, till at last they saw in the distance their father's house. Then they ran till they came up to it, rushed in at the door, and fell on their father's neck. The man had not had a quiet hour since he left his children in the wood; but the wife was dead. And when Grethel opened her apron the pearls and precious stones were scattered all over the room, and Hansel took one handful after another out of his pocket. Then was all care at an end, and they lived in great joy together. My tale is done, there runs a mouse, whosoever catches it, may make himself a big fur cap out of it.
"""

document = """
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best
performing models also connect the encoder and decoder through an attention
mechanism. We propose a new simple network architecture, the Transformer,
based solely on attention mechanisms, dispensing with recurrence and convolutions
entirely. Experiments on two machine translation tasks show these models to
be superior in quality while being more parallelizable and requiring significantly
less time to train. Our model achieves 28.4 BLEU on the WMT 2014 Englishto-German translation task, improving over the existing best results, including
ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task,
our model establishes a new single-model state-of-the-art BLEU score of 41.8 after
training for 3.5 days on eight GPUs, a small fraction of the training costs of the
best models from the literature. We show that the Transformer generalizes well to
other tasks by applying it successfully to English constituency parsing both with
large and limited training data.
∗Equal contribution. Listing order is random. Jakob proposed replacing RNNs with self-attention and started
the effort to evaluate this idea. Ashish, with Illia, designed and implemented the first Transformer models and
has been crucially involved in every aspect of this work. Noam proposed scaled dot-product attention, multi-head
attention and the parameter-free position representation and became the other person involved in nearly every
detail. Niki designed, implemented, tuned and evaluated countless model variants in our original codebase and
tensor2tensor. Llion also experimented with novel model variants, was responsible for our initial codebase, and
efficient inference and visualizations. Lukasz and Aidan spent countless long days designing various parts of and
implementing tensor2tensor, replacing our earlier codebase, greatly improving results and massively accelerating
our research.
†Work performed while at Google Brain.
‡Work performed while at Google Research.
31st Conference on Neural Information Processing Systems (NIPS 2017), Long Beach, CA, USA.
arXiv:1706.03762v7 [cs.CL] 2 Aug 2023
1 Introduction
Recurrent neural networks, long short-term memory [13] and gated recurrent [7] neural networks
in particular, have been firmly established as state of the art approaches in sequence modeling and
transduction problems such as language modeling and machine translation [35, 2, 5]. Numerous
efforts have since continued to push the boundaries of recurrent language models and encoder-decoder
architectures [38, 24, 15].
Recurrent models typically factor computation along the symbol positions of the input and output
sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden
states ht, as a function of the previous hidden state ht−1 and the input for position t. This inherently
sequential nature precludes parallelization within training examples, which becomes critical at longer
sequence lengths, as memory constraints limit batching across examples. Recent work has achieved
significant improvements in computational efficiency through factorization tricks [21] and conditional
computation [32], while also improving model performance in case of the latter. The fundamental
constraint of sequential computation, however, remains.
Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in
the input or output sequences [2, 19]. In all but a few cases [27], however, such attention mechanisms
are used in conjunction with a recurrent network.
In this work we propose the Transformer, a model architecture eschewing recurrence and instead
relying entirely on an attention mechanism to draw global dependencies between input and output.
The Transformer allows for significantly more parallelization and can reach a new state of the art in
translation quality after being trained for as little as twelve hours on eight P100 GPUs.
2 Background
The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU
[16], ByteNet [18] and ConvS2S [9], all of which use convolutional neural networks as basic building
block, computing hidden representations in parallel for all input and output positions. In these models,
the number of operations required to relate signals from two arbitrary input or output positions grows
in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes
it more difficult to learn dependencies between distant positions [12]. In the Transformer this is
reduced to a constant number of operations, albeit at the cost of reduced effective resolution due
to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention as
described in section 3.2.
Self-attention, sometimes called intra-attention is an attention mechanism relating different positions
of a single sequence in order to compute a representation of the sequence. Self-attention has been
used successfully in a variety of tasks including reading comprehension, abstractive summarization,
textual entailment and learning task-independent sentence representations [4, 27, 28, 22].
End-to-end memory networks are based on a recurrent attention mechanism instead of sequencealigned recurrence and have been shown to perform well on simple-language question answering and
language modeling tasks [34].
To the best of our knowledge, however, the Transformer is the first transduction model relying
entirely on self-attention to compute representations of its input and output without using sequencealigned RNNs or convolution. In the following sections, we will describe the Transformer, motivate
self-attention and discuss its advantages over models such as [17, 18] and [9].
3 Model Architecture
Most competitive neural sequence transduction models have an encoder-decoder structure [5, 2, 35].
Here, the encoder maps an input sequence of symbol representations (x1, ..., xn) to a sequence
of continuous representations z = (z1, ..., zn). Given z, the decoder then generates an output
sequence (y1, ..., ym) of symbols one element at a time. At each step the model is auto-regressive
[10], consuming the previously generated symbols as additional input when generating the next.
2
Figure 1: The Transformer - model architecture.
The Transformer follows this overall architecture using stacked self-attention and point-wise, fully
connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1,
respectively.
3.1 Encoder and Decoder Stacks
Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two
sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, positionwise fully connected feed-forward network. We employ a residual connection [11] around each of
the two sub-layers, followed by layer normalization [1]. That is, the output of each sub-layer is
LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer
itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding
layers, produce outputs of dimension dmodel = 512.
Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two
sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head
attention over the output of the encoder stack. Similar to the encoder, we employ residual connections
around each of the sub-layers, followed by layer normalization. We also modify the self-attention
sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This
masking, combined with fact that the output embeddings are offset by one position, ensures that the
predictions for position i can depend only on the known outputs at positions less than i.
3.2 Attention
An attention function can be described as mapping a query and a set of key-value pairs to an output,
where the query, keys, values, and output are all vectors. The output is computed as a weighted sum
3
Scaled Dot-Product Attention Multi-Head Attention
Figure 2: (left) Scaled Dot-Product Attention. (right) Multi-Head Attention consists of several
attention layers running in parallel.
of the values, where the weight assigned to each value is computed by a compatibility function of the
query with the corresponding key.
3.2.1 Scaled Dot-Product Attention
We call our particular attention "Scaled Dot-Product Attention" (Figure 2). The input consists of
queries and keys of dimension dk, and values of dimension dv. We compute the dot products of the
query with all keys, divide each by √
dk, and apply a softmax function to obtain the weights on the
values.
In practice, we compute the attention function on a set of queries simultaneously, packed together
into a matrix Q. The keys and values are also packed together into matrices K and V . We compute
the matrix of outputs as:
Attention(Q, K, V ) = softmax(QKT
√
dk
)V (1)
The two most commonly used attention functions are additive attention [2], and dot-product (multiplicative) attention. Dot-product attention is identical to our algorithm, except for the scaling factor
of √
1
dk
. Additive attention computes the compatibility function using a feed-forward network with
a single hidden layer. While the two are similar in theoretical complexity, dot-product attention is
much faster and more space-efficient in practice, since it can be implemented using highly optimized
matrix multiplication code.
While for small values of dk the two mechanisms perform similarly, additive attention outperforms
dot product attention without scaling for larger values of dk [3]. We suspect that for large values of
dk, the dot products grow large in magnitude, pushing the softmax function into regions where it has
extremely small gradients 4
. To counteract this effect, we scale the dot products by √
1
dk
.
3.2.2 Multi-Head Attention
Instead of performing a single attention function with dmodel-dimensional keys, values and queries,
we found it beneficial to linearly project the queries, keys and values h times with different, learned
linear projections to dk, dk and dv dimensions, respectively. On each of these projected versions of
queries, keys and values we then perform the attention function in parallel, yielding dv-dimensional
4To illustrate why the dot products get large, assume that the components of q and k are independent random
variables with mean 0 and variance 1. Then their dot product, q · k =
Pdk
i=1 qiki, has mean 0 and variance dk.
4
output values. These are concatenated and once again projected, resulting in the final values, as
depicted in Figure 2.
Multi-head attention allows the model to jointly attend to information from different representation
subspaces at different positions. With a single attention head, averaging inhibits this.
MultiHead(Q, K, V ) = Concat(head1, ..., headh)WO
where headi = Attention(QWQ
i
, KW K
i
, V WV
i
)
Where the projections are parameter matrices W
Q
i ∈ R
dmodel×dk , W K
i ∈ R
dmodel×dk , WV
i ∈ R
dmodel×dv
and WO ∈ R
hdv×dmodel
.
In this work we employ h = 8 parallel attention layers, or heads. For each of these we use
dk = dv = dmodel/h = 64. Due to the reduced dimension of each head, the total computational cost
is similar to that of single-head attention with full dimensionality.
3.2.3 Applications of Attention in our Model
The Transformer uses multi-head attention in three different ways:
• In "encoder-decoder attention" layers, the queries come from the previous decoder layer,
and the memory keys and values come from the output of the encoder. This allows every
position in the decoder to attend over all positions in the input sequence. This mimics the
typical encoder-decoder attention mechanisms in sequence-to-sequence models such as
[38, 2, 9].
• The encoder contains self-attention layers. In a self-attention layer all of the keys, values
and queries come from the same place, in this case, the output of the previous layer in the
encoder. Each position in the encoder can attend to all positions in the previous layer of the
encoder.
• Similarly, self-attention layers in the decoder allow each position in the decoder to attend to
all positions in the decoder up to and including that position. We need to prevent leftward
information flow in the decoder to preserve the auto-regressive property. We implement this
inside of scaled dot-product attention by masking out (setting to −∞) all values in the input
of the softmax which correspond to illegal connections. See Figure 2.
3.3 Position-wise Feed-Forward Networks
In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully
connected feed-forward network, which is applied to each position separately and identically. This
consists of two linear transformations with a ReLU activation in between.
FFN(x) = max(0, xW1 + b1)W2 + b2 (2)
While the linear transformations are the same across different positions, they use different parameters
from layer to layer. Another way of describing this is as two convolutions with kernel size 1.
The dimensionality of input and output is dmodel = 512, and the inner-layer has dimensionality
df f = 2048.
3.4 Embeddings and Softmax
Similarly to other sequence transduction models, we use learned embeddings to convert the input
tokens and output tokens to vectors of dimension dmodel. We also use the usual learned linear transformation and softmax function to convert the decoder output to predicted next-token probabilities. In
our model, we share the same weight matrix between the two embedding layers and the pre-softmax
linear transformation, similar to [30]. In the embedding layers, we multiply those weights by √
dmodel.
5
Table 1: Maximum path lengths, per-layer complexity and minimum number of sequential operations
for different layer types. n is the sequence length, d is the representation dimension, k is the kernel
size of convolutions and r the size of the neighborhood in restricted self-attention.
Layer Type Complexity per Layer Sequential Maximum Path Length
Operations
Self-Attention O(n
2
· d) O(1) O(1)
Recurrent O(n · d
2
) O(n) O(n)
Convolutional O(k · n · d
2
) O(1) O(logk(n))
Self-Attention (restricted) O(r · n · d) O(1) O(n/r)
3.5 Positional Encoding
Since our model contains no recurrence and no convolution, in order for the model to make use of the
order of the sequence, we must inject some information about the relative or absolute position of the
tokens in the sequence. To this end, we add "positional encodings" to the input embeddings at the
bottoms of the encoder and decoder stacks. The positional encodings have the same dimension dmodel
as the embeddings, so that the two can be summed. There are many choices of positional encodings,
learned and fixed [9].
In this work, we use sine and cosine functions of different frequencies:
P E(pos,2i) = sin(pos/100002i/dmodel)
P E(pos,2i+1) = cos(pos/100002i/dmodel)
where pos is the position and i is the dimension. That is, each dimension of the positional encoding
corresponds to a sinusoid. The wavelengths form a geometric progression from 2π to 10000 · 2π. We
chose this function because we hypothesized it would allow the model to easily learn to attend by
relative positions, since for any fixed offset k, P Epos+k can be represented as a linear function of
P Epos.
We also experimented with using learned positional embeddings [9] instead, and found that the two
versions produced nearly identical results (see Table 3 row (E)). We chose the sinusoidal version
because it may allow the model to extrapolate to sequence lengths longer than the ones encountered
during training.
4 Why Self-Attention
In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations
(x1, ..., xn) to another sequence of equal length (z1, ..., zn), with xi
, zi ∈ R
d
, such as a hidden
layer in a typical sequence transduction encoder or decoder. Motivating our use of self-attention we
consider three desiderata.
One is the total computational complexity per layer. Another is the amount of computation that can
be parallelized, as measured by the minimum number of sequential operations required.
The third is the path length between long-range dependencies in the network. Learning long-range
dependencies is a key challenge in many sequence transduction tasks. One key factor affecting the
ability to learn such dependencies is the length of the paths forward and backward signals have to
traverse in the network. The shorter these paths between any combination of positions in the input
and output sequences, the easier it is to learn long-range dependencies [12]. Hence we also compare
the maximum path length between any two input and output positions in networks composed of the
different layer types.
As noted in Table 1, a self-attention layer connects all positions with a constant number of sequentially
executed operations, whereas a recurrent layer requires O(n) sequential operations. In terms of
computational complexity, self-attention layers are faster than recurrent layers when the sequence
6
length n is smaller than the representation dimensionality d, which is most often the case with
sentence representations used by state-of-the-art models in machine translations, such as word-piece
[38] and byte-pair [31] representations. To improve computational performance for tasks involving
very long sequences, self-attention could be restricted to considering only a neighborhood of size r in
the input sequence centered around the respective output position. This would increase the maximum
path length to O(n/r). We plan to investigate this approach further in future work.
A single convolutional layer with kernel width k < n does not connect all pairs of input and output
positions. Doing so requires a stack of O(n/k) convolutional layers in the case of contiguous kernels,
or O(logk(n)) in the case of dilated convolutions [18], increasing the length of the longest paths
between any two positions in the network. Convolutional layers are generally more expensive than
recurrent layers, by a factor of k. Separable convolutions [6], however, decrease the complexity
considerably, to O(k · n · d + n · d
2
). Even with k = n, however, the complexity of a separable
convolution is equal to the combination of a self-attention layer and a point-wise feed-forward layer,
the approach we take in our model.
As side benefit, self-attention could yield more interpretable models. We inspect attention distributions
from our models and present and discuss examples in the appendix. Not only do individual attention
heads clearly learn to perform different tasks, many appear to exhibit behavior related to the syntactic
and semantic structure of the sentences.
5 Training
This section describes the training regime for our models.
5.1 Training Data and Batching
We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million
sentence pairs. Sentences were encoded using byte-pair encoding [3], which has a shared sourcetarget vocabulary of about 37000 tokens. For English-French, we used the significantly larger WMT
2014 English-French dataset consisting of 36M sentences and split tokens into a 32000 word-piece
vocabulary [38]. Sentence pairs were batched together by approximate sequence length. Each training
batch contained a set of sentence pairs containing approximately 25000 source tokens and 25000
target tokens.
5.2 Hardware and Schedule
We trained our models on one machine with 8 NVIDIA P100 GPUs. For our base models using
the hyperparameters described throughout the paper, each training step took about 0.4 seconds. We
trained the base models for a total of 100,000 steps or 12 hours. For our big models,(described on the
bottom line of table 3), step time was 1.0 seconds. The big models were trained for 300,000 steps
(3.5 days).
5.3 Optimizer
We used the Adam optimizer [20] with β1 = 0.9, β2 = 0.98 and ϵ = 10−9
. We varied the learning
rate over the course of training, according to the formula:
lrate = d
−0.5
model · min(step_num−0.5
, step_num · warmup_steps−1.5
) (3)
This corresponds to increasing the learning rate linearly for the first warmup_steps training steps,
and decreasing it thereafter proportionally to the inverse square root of the step number. We used
warmup_steps = 4000.
5.4 Regularization
We employ three types of regularization during training:
7
Table 2: The Transformer achieves better BLEU scores than previous state-of-the-art models on the
English-to-German and English-to-French newstest2014 tests at a fraction of the training cost.
Model
BLEU Training Cost (FLOPs)
EN-DE EN-FR EN-DE EN-FR
ByteNet [18] 23.75
Deep-Att + PosUnk [39] 39.2 1.0 · 1020
GNMT + RL [38] 24.6 39.92 2.3 · 1019 1.4 · 1020
ConvS2S [9] 25.16 40.46 9.6 · 1018 1.5 · 1020
MoE [32] 26.03 40.56 2.0 · 1019 1.2 · 1020
Deep-Att + PosUnk Ensemble [39] 40.4 8.0 · 1020
GNMT + RL Ensemble [38] 26.30 41.16 1.8 · 1020 1.1 · 1021
ConvS2S Ensemble [9] 26.36 41.29 7.7 · 1019 1.2 · 1021
Transformer (base model) 27.3 38.1 3.3 · 1018
Transformer (big) 28.4 41.8 2.3 · 1019
Residual Dropout We apply dropout [33] to the output of each sub-layer, before it is added to the
sub-layer input and normalized. In addition, we apply dropout to the sums of the embeddings and the
positional encodings in both the encoder and decoder stacks. For the base model, we use a rate of
Pdrop = 0.1.
Label Smoothing During training, we employed label smoothing of value ϵls = 0.1 [36]. This
hurts perplexity, as the model learns to be more unsure, but improves accuracy and BLEU score.
6 Results
6.1 Machine Translation
On the WMT 2014 English-to-German translation task, the big transformer model (Transformer (big)
in Table 2) outperforms the best previously reported models (including ensembles) by more than 2.0
BLEU, establishing a new state-of-the-art BLEU score of 28.4. The configuration of this model is
listed in the bottom line of Table 3. Training took 3.5 days on 8 P100 GPUs. Even our base model
surpasses all previously published models and ensembles, at a fraction of the training cost of any of
the competitive models.
On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0,
outperforming all of the previously published single models, at less than 1/4 the training cost of the
previous state-of-the-art model. The Transformer (big) model trained for English-to-French used
dropout rate Pdrop = 0.1, instead of 0.3.
For the base models, we used a single model obtained by averaging the last 5 checkpoints, which
were written at 10-minute intervals. For the big models, we averaged the last 20 checkpoints. We
used beam search with a beam size of 4 and length penalty α = 0.6 [38]. These hyperparameters
were chosen after experimentation on the development set. We set the maximum output length during
inference to input length + 50, but terminate early when possible [38].
Table 2 summarizes our results and compares our translation quality and training costs to other model
architectures from the literature. We estimate the number of floating point operations used to train a
model by multiplying the training time, the number of GPUs used, and an estimate of the sustained
single-precision floating-point capacity of each GPU 5
.
6.2 Model Variations
To evaluate the importance of different components of the Transformer, we varied our base model
in different ways, measuring the change in performance on English-to-German translation on the
5We used values of 2.8, 3.7, 6.0 and 9.5 TFLOPS for K80, K40, M40 and P100, respectively.
8
Table 3: Variations on the Transformer architecture. Unlisted values are identical to those of the base
model. All metrics are on the English-to-German translation development set, newstest2013. Listed
perplexities are per-wordpiece, according to our byte-pair encoding, and should not be compared to
per-word perplexities.
N dmodel dff h dk dv Pdrop ϵls
train PPL BLEU params
steps (dev) (dev) ×106
base 6 512 2048 8 64 64 0.1 0.1 100K 4.92 25.8 65
(A)
1 512 512 5.29 24.9
4 128 128 5.00 25.5
16 32 32 4.91 25.8
32 16 16 5.01 25.4
(B) 16 5.16 25.1 58
32 5.01 25.4 60
(C)
2 6.11 23.7 36
4 5.19 25.3 50
8 4.88 25.5 80
256 32 32 5.75 24.5 28
1024 128 128 4.66 26.0 168
1024 5.12 25.4 53
4096 4.75 26.2 90
(D)
0.0 5.77 24.6
0.2 4.95 25.5
0.0 4.67 25.3
0.2 5.47 25.7
(E) positional embedding instead of sinusoids 4.92 25.7
big 6 1024 4096 16 0.3 300K 4.33 26.4 213
development set, newstest2013. We used beam search as described in the previous section, but no
checkpoint averaging. We present these results in Table 3.
In Table 3 rows (A), we vary the number of attention heads and the attention key and value dimensions,
keeping the amount of computation constant, as described in Section 3.2.2. While single-head
attention is 0.9 BLEU worse than the best setting, quality also drops off with too many heads.
In Table 3 rows (B), we observe that reducing the attention key size dk hurts model quality. This
suggests that determining compatibility is not easy and that a more sophisticated compatibility
function than dot product may be beneficial. We further observe in rows (C) and (D) that, as expected,
bigger models are better, and dropout is very helpful in avoiding over-fitting. In row (E) we replace our
sinusoidal positional encoding with learned positional embeddings [9], and observe nearly identical
results to the base model.
6.3 English Constituency Parsing
To evaluate if the Transformer can generalize to other tasks we performed experiments on English
constituency parsing. This task presents specific challenges: the output is subject to strong structural
constraints and is significantly longer than the input. Furthermore, RNN sequence-to-sequence
models have not been able to attain state-of-the-art results in small-data regimes [37].
We trained a 4-layer transformer with dmodel = 1024 on the Wall Street Journal (WSJ) portion of the
Penn Treebank [25], about 40K training sentences. We also trained it in a semi-supervised setting,
using the larger high-confidence and BerkleyParser corpora from with approximately 17M sentences
[37]. We used a vocabulary of 16K tokens for the WSJ only setting and a vocabulary of 32K tokens
for the semi-supervised setting.
We performed only a small number of experiments to select the dropout, both attention and residual
(section 5.4), learning rates and beam size on the Section 22 development set, all other parameters
remained unchanged from the English-to-German base translation model. During inference, we
9
Table 4: The Transformer generalizes well to English constituency parsing (Results are on Section 23
of WSJ)
Parser Training WSJ 23 F1
Vinyals & Kaiser el al. (2014) [37] WSJ only, discriminative 88.3
Petrov et al. (2006) [29] WSJ only, discriminative 90.4
Zhu et al. (2013) [40] WSJ only, discriminative 90.4
Dyer et al. (2016) [8] WSJ only, discriminative 91.7
Transformer (4 layers) WSJ only, discriminative 91.3
Zhu et al. (2013) [40] semi-supervised 91.3
Huang & Harper (2009) [14] semi-supervised 91.3
McClosky et al. (2006) [26] semi-supervised 92.1
Vinyals & Kaiser el al. (2014) [37] semi-supervised 92.1
Transformer (4 layers) semi-supervised 92.7
Luong et al. (2015) [23] multi-task 93.0
Dyer et al. (2016) [8] generative 93.3
increased the maximum output length to input length + 300. We used a beam size of 21 and α = 0.3
for both WSJ only and the semi-supervised setting.
Our results in Table 4 show that despite the lack of task-specific tuning our model performs surprisingly well, yielding better results than all previously reported models with the exception of the
Recurrent Neural Network Grammar [8].
In contrast to RNN sequence-to-sequence models [37], the Transformer outperforms the BerkeleyParser [29] even when training only on the WSJ training set of 40K sentences.
7 Conclusion
In this work, we presented the Transformer, the first sequence transduction model based entirely on
attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with
multi-headed self-attention.
For translation tasks, the Transformer can be trained significantly faster than architectures based
on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014
English-to-French translation tasks, we achieve a new state of the art. In the former task our best
model outperforms even all previously reported ensembles.
We are excited about the future of attention-based models and plan to apply them to other tasks. We
plan to extend the Transformer to problems involving input and output modalities other than text and
to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs
such as images, audio and video. Making generation less sequential is another research goals of ours.
The code we used to train and evaluate our models is available at https://github.com/
tensorflow/tensor2tensor.
Acknowledgements We are grateful to Nal Kalchbrenner and Stephan Gouws for their fruitful
comments, corrections and inspiration.
"""
#Split the document into sentences
sentences = nltk.sent_tokenize(document)
print(sentences[2])
exit()
print("Num sentences:", len(sentences))

#Compute the sentence embeddings
embeddings = model.encode(sentences, convert_to_tensor=True)

#Compute the pair-wise cosine similarities
cos_scores = util.cos_sim(embeddings, embeddings).cpu().numpy()

#Compute the centrality for each sentence
centrality_scores = degree_centrality_scores(cos_scores, threshold=None)

#We argsort so that the first element is the sentence with the highest score
most_central_sentence_indices = np.argsort(-centrality_scores)


#Print the 5 sentences with the highest scores
print("\n\nSummary:")
for idx in most_central_sentence_indices[0:10]:
    print("-", sentences[idx].strip())